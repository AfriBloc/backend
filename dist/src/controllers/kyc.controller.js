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
var KycController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const kyc_service_1 = require("../services/kyc.service");
const sumsub_api_service_1 = require("../services/sumsub-api.service");
const kyc_webhook_dto_1 = require("../dto/kyc-webhook.dto");
const user_entity_1 = require("../entities/user.entity");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
let KycController = KycController_1 = class KycController {
    kycService;
    sumsubApiService;
    userRepository;
    logger = new common_1.Logger(KycController_1.name);
    constructor(kycService, sumsubApiService, userRepository) {
        this.kycService = kycService;
        this.sumsubApiService = sumsubApiService;
        this.userRepository = userRepository;
    }
    async handleWebhook(webhookData, signature, timestamp) {
        this.logger.log(`Received webhook: ${webhookData.type} for applicant ${webhookData.applicantId}`);
        try {
            if (signature && timestamp) {
                const bodyString = JSON.stringify(webhookData);
                const isValid = this.sumsubApiService.verifyWebhookSignature(bodyString, signature, timestamp);
                if (!isValid) {
                    this.logger.warn('Invalid webhook signature');
                    throw new common_1.HttpException('Invalid webhook signature', common_1.HttpStatus.UNAUTHORIZED);
                }
            }
            await this.kycService.processWebhook(webhookData);
            return {
                status: 'success',
                message: 'Webhook processed successfully',
            };
        }
        catch (error) {
            this.logger.error('Error processing webhook:', error);
            throw new common_1.HttpException('Failed to process webhook', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getKycStatus(req) {
        try {
            const status = await this.kycService.getUserKycStatus(req.user.id);
            return {
                status: 'success',
                data: status,
            };
        }
        catch (error) {
            this.logger.error('Error getting KYC status:', error);
            throw new common_1.HttpException('Failed to get KYC status', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async generateAccessToken(req) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: req.user.id },
                select: ['id', 'email'],
            });
            if (!user) {
                throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (!user.email) {
                throw new common_1.HttpException('User email is required for KYC verification', common_1.HttpStatus.BAD_REQUEST);
            }
            const tokenResponse = await this.sumsubApiService.generateSdkAccessToken(user.id, user.email, 'id-and-liveness', 600);
            this.logger.log(`Generated access token for user ${user.id}`);
            return {
                status: 'success',
                data: tokenResponse,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            this.logger.error('Error generating access token:', error);
            throw new common_1.HttpException('Failed to generate access token', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    healthCheck() {
        return {
            status: 'success',
            message: 'KYC service is healthy',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.KycController = KycController;
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-sumsub-signature')),
    __param(2, (0, common_1.Headers)('x-sumsub-timestamp')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [kyc_webhook_dto_1.KycWebhookDto, String, String]),
    __metadata("design:returntype", Promise)
], KycController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KycController.prototype, "getKycStatus", null);
__decorate([
    (0, common_1.Post)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KycController.prototype, "generateAccessToken", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], KycController.prototype, "healthCheck", null);
exports.KycController = KycController = KycController_1 = __decorate([
    (0, common_1.Controller)('kyc'),
    __param(2, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [kyc_service_1.KycService,
        sumsub_api_service_1.SumsubApiService,
        typeorm_1.Repository])
], KycController);
//# sourceMappingURL=kyc.controller.js.map