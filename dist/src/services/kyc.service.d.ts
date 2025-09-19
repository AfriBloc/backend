import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../entities/user.entity';
import { KycApplicant } from '../entities/kyc-applicant.entity';
import { KycWebhookEvent } from '../entities/kyc-webhook-event.entity';
import { SumsubApiService } from './sumsub-api.service';
import { KycWebhookDto } from '../dto/kyc-webhook.dto';
import { KycStatus } from '../enums/kyc-status.enum';
export declare class KycService {
    private readonly userRepository;
    private readonly kycApplicantRepository;
    private readonly kycWebhookEventRepository;
    private readonly sumsubApiService;
    private readonly eventEmitter;
    private readonly logger;
    constructor(userRepository: Repository<User>, kycApplicantRepository: Repository<KycApplicant>, kycWebhookEventRepository: Repository<KycWebhookEvent>, sumsubApiService: SumsubApiService, eventEmitter: EventEmitter2);
    processWebhook(webhookData: KycWebhookDto): Promise<void>;
    private handleApplicantCreated;
    private handleApplicantPending;
    private handleApplicantReviewed;
    private handleApplicantOnHold;
    private handleApplicantWorkflowCompleted;
    private handleApplicantWorkflowFailed;
    private handleApplicantReset;
    private handleApproval;
    private handleRejection;
    private extractPersonalInfo;
    private updateKycStatus;
    private updateKycApplicantRecord;
    private findUserByExternalId;
    getUserKycStatus(userId: string): Promise<{
        status: KycStatus;
        applicantId?: string;
        completedAt?: Date;
        rejectionReason?: string;
    }>;
    createApplicantForUser(userId: string, levelName: string): Promise<string>;
    generateAccessToken(userId: string, levelName: string): Promise<string>;
}
