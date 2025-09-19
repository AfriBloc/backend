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
var KycWebSocketListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycWebSocketListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const notifications_gateway_1 = require("../gateways/notifications.gateway");
const kyc_approved_event_1 = require("../events/kyc-approved.event");
const kyc_rejected_event_1 = require("../events/kyc-rejected.event");
const kyc_on_hold_event_1 = require("../events/kyc-on-hold.event");
let KycWebSocketListener = KycWebSocketListener_1 = class KycWebSocketListener {
    notificationsGateway;
    logger = new common_1.Logger(KycWebSocketListener_1.name);
    constructor(notificationsGateway) {
        this.notificationsGateway = notificationsGateway;
    }
    async handleKycApproved(event) {
        this.logger.log(`Sending KYC approval notification to user: ${event.userId}`);
        try {
            this.notificationsGateway.sendKycStatusUpdate(event.userId, {
                status: 'approved',
                message: 'Your KYC verification has been approved! Your wallet will be created shortly.',
                timestamp: new Date(),
            });
            this.notificationsGateway.sendNotification(event.userId, {
                type: 'kyc_approved',
                title: 'KYC Verification Approved',
                message: 'Congratulations! Your identity verification has been successfully completed.',
                data: {
                    applicantId: event.applicantId,
                    userData: event.userData,
                },
                timestamp: new Date(),
            });
            this.logger.log(`KYC approval notification sent to user ${event.userId}`);
        }
        catch (error) {
            this.logger.error(`Error sending KYC approval notification to user ${event.userId}:`, error);
        }
    }
    async handleKycRejected(event) {
        this.logger.log(`Sending KYC rejection notification to user: ${event.userId}`);
        try {
            this.notificationsGateway.sendKycStatusUpdate(event.userId, {
                status: 'rejected',
                message: `Your KYC verification was declined: ${event.rejectionReason}`,
                timestamp: new Date(),
            });
            this.notificationsGateway.sendNotification(event.userId, {
                type: 'kyc_rejected',
                title: 'KYC Verification Declined',
                message: event.reviewRejectType === 'RETRY'
                    ? 'Your verification was declined but you can resubmit your documents.'
                    : 'Your verification was declined. Please contact support for assistance.',
                data: {
                    applicantId: event.applicantId,
                    rejectionReason: event.rejectionReason,
                    rejectLabels: event.rejectLabels,
                    reviewRejectType: event.reviewRejectType,
                },
                timestamp: new Date(),
            });
            this.logger.log(`KYC rejection notification sent to user ${event.userId}`);
        }
        catch (error) {
            this.logger.error(`Error sending KYC rejection notification to user ${event.userId}:`, error);
        }
    }
    async handleKycOnHold(event) {
        this.logger.log(`Sending KYC on-hold notification to user: ${event.userId}`);
        try {
            this.notificationsGateway.sendKycStatusUpdate(event.userId, {
                status: 'on_hold',
                message: 'Your KYC verification is currently under manual review.',
                timestamp: new Date(),
            });
            this.notificationsGateway.sendNotification(event.userId, {
                type: 'kyc_on_hold',
                title: 'KYC Under Review',
                message: 'Your verification is being reviewed by our team. We will update you once complete.',
                data: {
                    applicantId: event.applicantId,
                    reason: event.reason,
                },
                timestamp: new Date(),
            });
            this.logger.log(`KYC on-hold notification sent to user ${event.userId}`);
        }
        catch (error) {
            this.logger.error(`Error sending KYC on-hold notification to user ${event.userId}:`, error);
        }
    }
    async handleWalletCreated(event) {
        this.logger.log(`Sending wallet creation notification to user: ${event.userId}`);
        try {
            this.notificationsGateway.sendWalletCreatedNotification(event.userId, {
                walletType: event.walletType,
                address: event.address,
                network: event.network,
                timestamp: new Date(),
            });
            this.notificationsGateway.sendNotification(event.userId, {
                type: 'wallet_created',
                title: 'Wallet Created',
                message: `Your ${event.walletType} wallet has been successfully created.`,
                data: {
                    walletType: event.walletType,
                    address: event.address,
                    network: event.network,
                },
                timestamp: new Date(),
            });
            this.logger.log(`Wallet creation notification sent to user ${event.userId}`);
        }
        catch (error) {
            this.logger.error(`Error sending wallet creation notification to user ${event.userId}:`, error);
        }
    }
};
exports.KycWebSocketListener = KycWebSocketListener;
__decorate([
    (0, event_emitter_1.OnEvent)('kyc.approved'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [kyc_approved_event_1.KycApprovedEvent]),
    __metadata("design:returntype", Promise)
], KycWebSocketListener.prototype, "handleKycApproved", null);
__decorate([
    (0, event_emitter_1.OnEvent)('kyc.rejected'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [kyc_rejected_event_1.KycRejectedEvent]),
    __metadata("design:returntype", Promise)
], KycWebSocketListener.prototype, "handleKycRejected", null);
__decorate([
    (0, event_emitter_1.OnEvent)('kyc.onHold'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [kyc_on_hold_event_1.KycOnHoldEvent]),
    __metadata("design:returntype", Promise)
], KycWebSocketListener.prototype, "handleKycOnHold", null);
__decorate([
    (0, event_emitter_1.OnEvent)('wallet.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KycWebSocketListener.prototype, "handleWalletCreated", null);
exports.KycWebSocketListener = KycWebSocketListener = KycWebSocketListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_gateway_1.NotificationsGateway])
], KycWebSocketListener);
//# sourceMappingURL=kyc-websocket.listener.js.map