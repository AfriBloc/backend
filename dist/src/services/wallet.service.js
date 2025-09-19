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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_wallet_entity_1 = require("../entities/user-wallet.entity");
const fireblocks_service_1 = require("./fireblocks.service");
const rate_service_1 = require("./rate.service");
let WalletService = class WalletService {
    walletRepository;
    rateService;
    fireblocksService;
    constructor(walletRepository, rateService, fireblocksService) {
        this.walletRepository = walletRepository;
        this.rateService = rateService;
        this.fireblocksService = fireblocksService;
    }
    async createWallet(user) {
        try {
            const fireblocksWallet = await this.createFireblocksWallet(user);
            const wallet = new user_wallet_entity_1.UserWallet();
            wallet.user = user;
            wallet.networkType = user_wallet_entity_1.NetworkType.TESTNET;
            wallet.vaultId = fireblocksWallet.vaultId;
            wallet.walletAddress = fireblocksWallet.address;
            wallet.evmAddress = fireblocksWallet.evmAddress;
            wallet.asset = fireblocksWallet.asset;
            wallet.currency = user_wallet_entity_1.Currency.HBAR;
            wallet.isActive = true;
            wallet.balance = 0;
            return this.walletRepository.save(wallet);
        }
        catch (error) {
            throw new Error(`Failed to create wallet: ${error.message}`);
        }
    }
    async createFireblocksWallet(user) {
        try {
            const response = await this.fireblocksService.createHederaWallet(user);
            return response;
        }
        catch (error) {
            throw new Error(`Failed to create Fireblocks wallet: ${error.message}`);
        }
    }
    catch(error) {
        throw new Error(`Fireblocks API error: ${error.message}`);
    }
    async getWalletBalance(userId) {
        const wallet = await this.walletRepository.findOne({
            where: { userId },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        try {
            const [hbarBalance, usdRate, ngnRate] = await Promise.all([
                this.fireblocksService.getWalletBalance(wallet),
                this.rateService.getRate('hedera-hashgraph', 'usd'),
                this.rateService.getRate('hedera-hashgraph', 'ngn'),
            ]);
            const balance = Number(hbarBalance);
            return {
                hbar: balance,
                usd: balance * Number(usdRate.rate),
                ngn: balance * Number(ngnRate.rate),
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Failed to get wallet balance: ${error.message}`);
        }
    }
    async getUserWallet(userId) {
        const wallet = await this.walletRepository.findOneBy({ userId });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        return wallet;
    }
    async deactivateWallet(walletId) {
        const wallet = await this.walletRepository.findOne({
            where: { id: walletId },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        wallet.isActive = false;
        return this.walletRepository.save(wallet);
    }
    async activateWallet(walletId) {
        const wallet = await this.walletRepository.findOne({
            where: { id: walletId },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        wallet.isActive = true;
        return this.walletRepository.save(wallet);
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_wallet_entity_1.UserWallet)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        rate_service_1.RateService,
        fireblocks_service_1.FireblocksService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map