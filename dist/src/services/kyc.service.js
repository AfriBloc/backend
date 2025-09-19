"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var KycService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const user_entity_1 = require("../entities/user.entity");
const kyc_applicant_entity_1 = require("../entities/kyc-applicant.entity");
const kyc_webhook_event_entity_1 = require("../entities/kyc-webhook-event.entity");
const sumsub_api_service_1 = require("./sumsub-api.service");
const kyc_status_enum_1 = require("../enums/kyc-status.enum");
const kyc_approved_event_1 = require("../events/kyc-approved.event");
const kyc_rejected_event_1 = require("../events/kyc-rejected.event");
const kyc_on_hold_event_1 = require("../events/kyc-on-hold.event");
let KycService = KycService_1 = class KycService {
    userRepository;
    kycApplicantRepository;
    kycWebhookEventRepository;
    sumsubApiService;
    eventEmitter;
    logger = new common_1.Logger(KycService_1.name);
    constructor(userRepository, kycApplicantRepository, kycWebhookEventRepository, sumsubApiService, eventEmitter) {
        this.userRepository = userRepository;
        this.kycApplicantRepository = kycApplicantRepository;
        this.kycWebhookEventRepository = kycWebhookEventRepository;
        this.sumsubApiService = sumsubApiService;
        this.eventEmitter = eventEmitter;
    }
    async processWebhook(webhookData) {
        const eventId = `${webhookData.applicantId}-${webhookData.type}-${Date.now()}`;
        this.logger.log(`Processing webhook event: ${eventId}, type: ${webhookData.type}`);
        if (!webhookData.externalUserId)
            return;
        const user = await this.findUserByExternalId(webhookData.externalUserId);
        if (!user)
            return;
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
            webhookEvent.processed = true;
            webhookEvent.processedAt = new Date();
            await this.kycWebhookEventRepository.save(webhookEvent);
            this.logger.log(`Successfully processed webhook event: ${eventId}`);
        }
        catch (error) {
            this.logger.error(`Error processing webhook event ${eventId}:`, error);
            webhookEvent.errorMessage = error.message;
            webhookEvent.retryCount += 1;
            await this.kycWebhookEventRepository.save(webhookEvent);
            throw error;
        }
    }
    async handleApplicantCreated(webhookData) {
        if (!webhookData.externalUserId)
            return;
        const user = await this.findUserByExternalId(webhookData.externalUserId);
        if (!user)
            return;
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
                reviewStatus: kyc_status_enum_1.KycStatus.PENDING,
                rawData: webhookData,
            });
            await this.kycApplicantRepository.save(kycApplicant);
        }
        user.kycApplicantId = webhookData.applicantId;
        user.kycStatus = kyc_status_enum_1.KycStatus.PENDING;
        await this.userRepository.save(user);
    }
    async handleApplicantPending(webhookData) {
        await this.updateKycStatus(webhookData, kyc_status_enum_1.KycStatus.PENDING);
    }
    async handleApplicantReviewed(webhookData) {
        const reviewAnswer = webhookData.reviewResult?.reviewAnswer;
        if (reviewAnswer === 'GREEN') {
            await this.handleApproval(webhookData);
        }
        else if (reviewAnswer === 'RED') {
            await this.handleRejection(webhookData);
        }
    }
    async handleApplicantOnHold(webhookData) {
        await this.updateKycStatus(webhookData, kyc_status_enum_1.KycStatus.ON_HOLD);
        if (webhookData.externalUserId) {
            const user = await this.findUserByExternalId(webhookData.externalUserId);
            if (user) {
                this.eventEmitter.emit('kyc.onHold', new kyc_on_hold_event_1.KycOnHoldEvent(user.id, webhookData.applicantId, 'KYC verification is on hold for manual review'));
            }
        }
    }
    async handleApplicantWorkflowCompleted(webhookData) {
        const reviewAnswer = webhookData.reviewResult?.reviewAnswer;
        if (reviewAnswer === 'GREEN') {
            await this.handleApproval(webhookData);
        }
        else if (reviewAnswer === 'RED') {
            await this.handleRejection(webhookData);
        }
    }
    async handleApplicantWorkflowFailed(webhookData) {
        await this.handleRejection(webhookData);
    }
    async handleApplicantReset(webhookData) {
        await this.updateKycStatus(webhookData, kyc_status_enum_1.KycStatus.RESET);
    }
    async handleApproval(webhookData) {
        console.log(webhookData);
        if (!webhookData.externalUserId)
            return;
        const user = await this.findUserByExternalId(webhookData.externalUserId);
        if (!user)
            return;
        const applicantData = await this.sumsubApiService.getApplicantData(webhookData.applicantId);
        const personalInfo = this.extractPersonalInfo(applicantData);
        user.kycStatus = kyc_status_enum_1.KycStatus.APPROVED;
        user.kycCompletedAt = new Date();
        if (personalInfo.firstName && !user.firstName)
            user.firstName = personalInfo.firstName;
        if (personalInfo.lastName && !user.lastName)
            user.lastName = personalInfo.lastName;
        if (personalInfo.middleName && !user.middleName)
            user.middleName = personalInfo.middleName;
        if (personalInfo.dateOfBirth)
            user.dateOfBirth = personalInfo.dateOfBirth;
        if (personalInfo.phone_number)
            user.phoneNumber = personalInfo.phone_number;
        if (personalInfo.gender)
            user.gender = personalInfo.gender;
        if (personalInfo.nationality)
            user.nationality = personalInfo.nationality;
        if (personalInfo.placeOfBirth)
            user.placeOfBirth = personalInfo.placeOfBirth;
        await this.userRepository.save(user);
        await this.updateKycApplicantRecord(webhookData, kyc_status_enum_1.KycStatus.APPROVED);
        this.eventEmitter.emit('kyc.approved', new kyc_approved_event_1.KycApprovedEvent(user.id, webhookData.applicantId, personalInfo));
        this.logger.log(`KYC approved for user ${user.id}`);
    }
    async handleRejection(webhookData) {
        if (!webhookData.externalUserId)
            return;
        const user = await this.findUserByExternalId(webhookData.externalUserId);
        if (!user)
            return;
        user.kycStatus = kyc_status_enum_1.KycStatus.REJECTED;
        await this.userRepository.save(user);
        await this.updateKycApplicantRecord(webhookData, kyc_status_enum_1.KycStatus.REJECTED);
        const rejectLabels = webhookData.reviewResult?.rejectLabels || [];
        const reviewRejectType = webhookData.reviewResult?.reviewRejectType || 'FINAL';
        this.eventEmitter.emit('kyc.rejected', new kyc_rejected_event_1.KycRejectedEvent(user.id, webhookData.applicantId, webhookData.reviewResult?.moderationComment ||
            'KYC verification failed', rejectLabels, reviewRejectType));
        this.logger.log(`KYC rejected for user ${user.id}`);
    }
    extractPersonalInfo(applicantData) {
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
    async updateKycStatus(webhookData, status) {
        if (webhookData.externalUserId) {
            const user = await this.findUserByExternalId(webhookData.externalUserId);
            if (user) {
                user.kycStatus = status;
                await this.userRepository.save(user);
            }
        }
        await this.updateKycApplicantRecord(webhookData, status);
    }
    async updateKycApplicantRecord(webhookData, status) {
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
    async findUserByExternalId(externalUserId) {
        if (!externalUserId)
            return null;
        return this.userRepository.findOne({
            where: { id: externalUserId },
        });
    }
    async getUserKycStatus(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const result = {
            status: user.kycStatus,
            applicantId: user.kycApplicantId,
            completedAt: user.kycCompletedAt,
        };
        if (user.kycStatus === kyc_status_enum_1.KycStatus.REJECTED && user.kycApplicantId) {
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
    async createApplicantForUser(userId, levelName) {
        const applicantData = await this.sumsubApiService.createApplicant(userId, levelName);
        await this.userRepository.update(userId, {
            kycApplicantId: applicantData.id,
        });
        return applicantData.id;
    }
    async generateAccessToken(userId, levelName) {
        return this.sumsubApiService.generateAccessToken(userId, levelName);
    }
};
exports.KycService = KycService;
exports.KycService = KycService = KycService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(kyc_applicant_entity_1.KycApplicant)),
    __param(2, (0, typeorm_1.InjectRepository)(kyc_webhook_event_entity_1.KycWebhookEvent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        sumsub_api_service_1.SumsubApiService,
        event_emitter_1.EventEmitter2])
], KycService);
//# sourceMappingURL=kyc.service.js.map