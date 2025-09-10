import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../entities/user.entity';
import { KycApplicant } from '../entities/kyc-applicant.entity';
import { KycWebhookEvent } from '../entities/kyc-webhook-event.entity';
import { SumsubApiService } from './sumsub-api.service';
import { KycWebhookDto } from '../dto/kyc-webhook.dto';
import { KycStatus } from '../enums/kyc-status.enum';
import { KycApprovedEvent } from '../events/kyc-approved.event';
import { KycRejectedEvent } from '../events/kyc-rejected.event';
import { KycOnHoldEvent } from '../events/kyc-on-hold.event';

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(KycApplicant)
    private readonly kycApplicantRepository: Repository<KycApplicant>,
    @InjectRepository(KycWebhookEvent)
    private readonly kycWebhookEventRepository: Repository<KycWebhookEvent>,
    private readonly sumsubApiService: SumsubApiService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Process Sumsub webhook
   */
  async processWebhook(webhookData: KycWebhookDto): Promise<void> {
    const eventId = `${webhookData.applicantId}-${webhookData.type}-${Date.now()}`;

    this.logger.log(
      `Processing webhook event: ${eventId}, type: ${webhookData.type}`,
    );

    if (!webhookData.externalUserId) return;
    const user = await this.findUserByExternalId(webhookData.externalUserId);
    if (!user) return;

    // Store webhook event for audit trail
    const webhookEvent = this.kycWebhookEventRepository.create({
      eventId,
      eventType: webhookData.type,
      applicantId: webhookData.applicantId,
      externalUserId: webhookData.externalUserId,
      payload: webhookData,
      processed: false,
    });

    console.log(webhookEvent);

    try {
      await this.kycWebhookEventRepository.save(webhookEvent);

      // Process different webhook types
      switch (webhookData.type) {
        case 'applicantCreated':
          await this.handleApplicantCreated(webhookData);
          break;
        case 'applicantPending':
          await this.handleApplicantPending(webhookData);
          break;
        case 'applicantReviewed':
          await this.handleApplicantReviewed(webhookData);
          break;
        case 'applicantOnHold':
          await this.handleApplicantOnHold(webhookData);
          break;
        case 'applicantWorkflowCompleted':
          await this.handleApplicantWorkflowCompleted(webhookData);
          break;
        case 'applicantWorkflowFailed':
          await this.handleApplicantWorkflowFailed(webhookData);
          break;
        case 'applicantReset':
          await this.handleApplicantReset(webhookData);
          break;
        default:
          this.logger.warn(`Unhandled webhook type: ${webhookData.type}`);
      }

      // Mark webhook as processed
      webhookEvent.processed = true;
      webhookEvent.processedAt = new Date();
      await this.kycWebhookEventRepository.save(webhookEvent);

      this.logger.log(`Successfully processed webhook event: ${eventId}`);
    } catch (error) {
      this.logger.error(`Error processing webhook event ${eventId}:`, error);

      // Update webhook event with error
      webhookEvent.errorMessage = error.message;
      webhookEvent.retryCount += 1;
      await this.kycWebhookEventRepository.save(webhookEvent);

      throw error;
    }
  }

  /**
   * Handle applicant created event
   */
  private async handleApplicantCreated(
    webhookData: KycWebhookDto,
  ): Promise<void> {
    if (!webhookData.externalUserId) return;
    const user = await this.findUserByExternalId(webhookData.externalUserId);
    if (!user) return;

    // Create or update KYC applicant record
    let kycApplicant = await this.kycApplicantRepository.findOne({
      where: { applicantId: webhookData.applicantId },
    });

    if (!kycApplicant) {
      kycApplicant = this.kycApplicantRepository.create({
        userId: user.id,
        applicantId: webhookData.applicantId,
        inspectionId: webhookData.inspectionId,
        externalUserId: webhookData.externalUserId,
        levelName: webhookData.levelName,
        reviewStatus: KycStatus.PENDING,
        rawData: webhookData,
      });
      await this.kycApplicantRepository.save(kycApplicant);
    }

    // Update user KYC status
    user.kycApplicantId = webhookData.applicantId;
    user.kycStatus = KycStatus.PENDING;
    await this.userRepository.save(user);
  }

  /**
   * Handle applicant pending event
   */
  private async handleApplicantPending(
    webhookData: KycWebhookDto,
  ): Promise<void> {
    await this.updateKycStatus(webhookData, KycStatus.PENDING);
  }

  /**
   * Handle applicant reviewed event
   */
  private async handleApplicantReviewed(
    webhookData: KycWebhookDto,
  ): Promise<void> {
    const reviewAnswer = webhookData.reviewResult?.reviewAnswer;

    if (reviewAnswer === 'GREEN') {
      await this.handleApproval(webhookData);
    } else if (reviewAnswer === 'RED') {
      await this.handleRejection(webhookData);
    }
  }

  /**
   * Handle applicant on hold event
   */
  private async handleApplicantOnHold(
    webhookData: KycWebhookDto,
  ): Promise<void> {
    await this.updateKycStatus(webhookData, KycStatus.ON_HOLD);

    if (webhookData.externalUserId) {
      const user = await this.findUserByExternalId(webhookData.externalUserId);
      if (user) {
        this.eventEmitter.emit(
          'kyc.onHold',
          new KycOnHoldEvent(
            user.id,
            webhookData.applicantId,
            'KYC verification is on hold for manual review',
          ),
        );
      }
    }
  }

  /**
   * Handle applicant workflow completed event
   */
  private async handleApplicantWorkflowCompleted(
    webhookData: KycWebhookDto,
  ): Promise<void> {
    const reviewAnswer = webhookData.reviewResult?.reviewAnswer;

    if (reviewAnswer === 'GREEN') {
      await this.handleApproval(webhookData);
    } else if (reviewAnswer === 'RED') {
      await this.handleRejection(webhookData);
    }
  }

  /**
   * Handle applicant workflow failed event
   */
  private async handleApplicantWorkflowFailed(
    webhookData: KycWebhookDto,
  ): Promise<void> {
    await this.handleRejection(webhookData);
  }

  /**
   * Handle applicant reset event
   */
  private async handleApplicantReset(
    webhookData: KycWebhookDto,
  ): Promise<void> {
    await this.updateKycStatus(webhookData, KycStatus.RESET);
  }

  /**
   * Handle KYC approval
   */
  private async handleApproval(webhookData: KycWebhookDto): Promise<void> {
    console.log(webhookData);
    if (!webhookData.externalUserId) return;
    const user = await this.findUserByExternalId(webhookData.externalUserId);
    if (!user) return;

    // Fetch detailed applicant data from Sumsub
    const applicantData = await this.sumsubApiService.getApplicantData(
      webhookData.applicantId,
    );

    // Extract personal information from applicant data
    const personalInfo = this.extractPersonalInfo(applicantData);

    // Update user with KYC approval and personal information
    user.kycStatus = KycStatus.APPROVED;
    user.kycCompletedAt = new Date();

    // Update personal information from KYC data
    if (personalInfo.firstName) user.firstName = personalInfo.firstName;
    if (personalInfo.lastName) user.lastName = personalInfo.lastName;
    if (personalInfo.middleName) user.middleName = personalInfo.middleName;
    if (personalInfo.dateOfBirth) user.dateOfBirth = personalInfo.dateOfBirth;
    if (personalInfo.gender) user.gender = personalInfo.gender;
    if (personalInfo.nationality) user.nationality = personalInfo.nationality;
    if (personalInfo.placeOfBirth)
      user.placeOfBirth = personalInfo.placeOfBirth;

    await this.userRepository.save(user);

    // Update KYC applicant record
    await this.updateKycApplicantRecord(webhookData, KycStatus.APPROVED);

    // Emit approval event for wallet creation and notifications
    this.eventEmitter.emit(
      'kyc.approved',
      new KycApprovedEvent(user.id, webhookData.applicantId, personalInfo),
    );

    this.logger.log(`KYC approved for user ${user.id}`);
  }

  /**
   * Handle KYC rejection
   */
  private async handleRejection(webhookData: KycWebhookDto): Promise<void> {
    if (!webhookData.externalUserId) return;
    const user = await this.findUserByExternalId(webhookData.externalUserId);
    if (!user) return;

    // Update user KYC status
    user.kycStatus = KycStatus.REJECTED;
    await this.userRepository.save(user);

    // Update KYC applicant record
    await this.updateKycApplicantRecord(webhookData, KycStatus.REJECTED);

    // Emit rejection event
    const rejectLabels = webhookData.reviewResult?.rejectLabels || [];
    const reviewRejectType =
      webhookData.reviewResult?.reviewRejectType || 'FINAL';

    this.eventEmitter.emit(
      'kyc.rejected',
      new KycRejectedEvent(
        user.id,
        webhookData.applicantId,
        webhookData.reviewResult?.moderationComment ||
          'KYC verification failed',
        rejectLabels,
        reviewRejectType,
      ),
    );

    this.logger.log(`KYC rejected for user ${user.id}`);
  }

  /**
   * Extract personal information from Sumsub applicant data
   */
  private extractPersonalInfo(applicantData: any): any {
    const info = applicantData.info || {};

    return {
      firstName: info.firstName,
      lastName: info.lastName,
      middleName: info.middleName,
      dateOfBirth: info.dob ? new Date(info.dob) : null,
      gender: info.gender,
      nationality: info.nationality,
      placeOfBirth: info.placeOfBirth,
    };
  }

  /**
   * Update KYC status
   */
  private async updateKycStatus(
    webhookData: KycWebhookDto,
    status: KycStatus,
  ): Promise<void> {
    if (webhookData.externalUserId) {
      const user = await this.findUserByExternalId(webhookData.externalUserId);
      if (user) {
        user.kycStatus = status;
        await this.userRepository.save(user);
      }
    }

    await this.updateKycApplicantRecord(webhookData, status);
  }

  /**
   * Update KYC applicant record
   */
  private async updateKycApplicantRecord(
    webhookData: KycWebhookDto,
    status: KycStatus,
  ): Promise<void> {
    const kycApplicant = await this.kycApplicantRepository.findOne({
      where: { applicantId: webhookData.applicantId },
    });

    if (kycApplicant) {
      kycApplicant.reviewStatus = status;
      kycApplicant.reviewAnswer =
        webhookData.reviewResult?.reviewAnswer || null;
      kycApplicant.rejectLabels =
        webhookData.reviewResult?.rejectLabels || null;
      kycApplicant.reviewRejectType =
        webhookData.reviewResult?.reviewRejectType || null;
      kycApplicant.clientComment =
        webhookData.reviewResult?.clientComment || null;
      kycApplicant.moderationComment =
        webhookData.reviewResult?.moderationComment || null;
      kycApplicant.rawData = webhookData;

      await this.kycApplicantRepository.save(kycApplicant);
    }
  }

  /**
   * Find user by external user ID
   */
  private async findUserByExternalId(
    externalUserId: string,
  ): Promise<User | null> {
    if (!externalUserId) return null;

    return this.userRepository.findOne({
      where: { id: externalUserId },
    });
  }

  /**
   * Get user KYC status
   */
  async getUserKycStatus(userId: string): Promise<{
    status: KycStatus;
    applicantId?: string;
    completedAt?: Date;
    rejectionReason?: string;
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const result: any = {
      status: user.kycStatus,
      applicantId: user.kycApplicantId,
      completedAt: user.kycCompletedAt,
    };

    // If rejected, get rejection reason
    if (user.kycStatus === KycStatus.REJECTED && user.kycApplicantId) {
      const kycApplicant = await this.kycApplicantRepository.findOne({
        where: { applicantId: user.kycApplicantId },
      });

      if (kycApplicant) {
        result.rejectionReason =
          kycApplicant.moderationComment || 'KYC verification failed';
      }
    }

    return result;
  }

  /**
   * Create Sumsub applicant for user
   */
  async createApplicantForUser(
    userId: string,
    levelName: string,
  ): Promise<string> {
    const applicantData = await this.sumsubApiService.createApplicant(
      userId,
      levelName,
    );

    // Update user with applicant ID
    await this.userRepository.update(userId, {
      kycApplicantId: applicantData.id,
    });

    return applicantData.id;
  }

  /**
   * Generate access token for user KYC
   */
  async generateAccessToken(
    userId: string,
    levelName: string,
  ): Promise<string> {
    return this.sumsubApiService.generateAccessToken(userId, levelName);
  }
}
