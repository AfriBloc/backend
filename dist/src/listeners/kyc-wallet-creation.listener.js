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
var KycWalletCreationListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycWalletCreationListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const kyc_approved_event_1 = require("../events/kyc-approved.event");
const user_entity_1 = require("../entities/user.entity");
const wallet_service_1 = require("../services/wallet.service");
const user_wallet_entity_1 = require("../entities/user-wallet.entity");
const mail_service_1 = require("../services/mail.service");
let KycWalletCreationListener = KycWalletCreationListener_1 = class KycWalletCreationListener {
    eventEmitter;
    userRepository;
    walletService;
    mailService;
    logger = new common_1.Logger(KycWalletCreationListener_1.name);
    constructor(eventEmitter, userRepository, walletService, mailService) {
        this.eventEmitter = eventEmitter;
        this.userRepository = userRepository;
        this.walletService = walletService;
        this.mailService = mailService;
    }
    async handleKycApprovedCreateHederaWallet(event) {
        this.logger.log(`Creating wallet for approved KYC user: ${event.userId}`);
        try {
            const user = await this.userRepository.findOne({
                where: { id: event.userId },
            });
            if (!user) {
                this.logger.error(`User not found for wallet creation: ${event.userId}`);
                return;
            }
            const hederaWallet = await this.walletService.createWallet(user);
            this.logger.log(`wallet created for user ${event.userId}: ${hederaWallet.walletAddress}`);
            this.mailService.sendWalletCreatedEmail(hederaWallet, user);
            this.eventEmitter.emit('wallet.created', {
                userId: event.userId,
                walletType: user_wallet_entity_1.WalletType.HEDERA,
                address: hederaWallet.walletAddress,
                network: hederaWallet.networkType,
            });
        }
        catch (error) {
            this.logger.error(`Error creating wallet for user ${event.userId}:`, error);
        }
    }
};
exports.KycWalletCreationListener = KycWalletCreationListener;
__decorate([
    (0, event_emitter_1.OnEvent)('kyc.approved'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [kyc_approved_event_1.KycApprovedEvent]),
    __metadata("design:returntype", Promise)
], KycWalletCreationListener.prototype, "handleKycApprovedCreateHederaWallet", null);
exports.KycWalletCreationListener = KycWalletCreationListener = KycWalletCreationListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2,
        typeorm_2.Repository,
        wallet_service_1.WalletService,
        mail_service_1.MailService])
], KycWalletCreationListener);
//# sourceMappingURL=kyc-wallet-creation.listener.js.map