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
var WalletController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const common_1 = require("@nestjs/common");
const wallet_service_1 = require("../services/wallet.service");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const fireblocks_service_1 = require("../services/fireblocks.service");
const transaction_service_1 = require("../services/transaction.service");
const get_all_transactions_dto_1 = require("../dto/get-all-transactions.dto");
let WalletController = WalletController_1 = class WalletController {
    walletService;
    fireblocksService;
    transactionService;
    logger = new common_1.Logger(WalletController_1.name);
    constructor(walletService, fireblocksService, transactionService) {
        this.walletService = walletService;
        this.fireblocksService = fireblocksService;
        this.transactionService = transactionService;
    }
    async getUserWallet(req) {
        const userId = req.user.id;
        const wallet = await this.walletService.getUserWallet(userId);
        return {
            status: 'success',
            data: wallet,
        };
    }
    async getWalletBalance(req) {
        const userId = req.user.id;
        const balance = await this.walletService.getWalletBalance(userId);
        return {
            status: 'success',
            data: { balance },
        };
    }
    async getWalletTransactions(req, query) {
        const userId = req.user.id;
        const transactions = await this.transactionService.getUserTransactions(userId, query.limit, query.page);
        return {
            status: 'success',
            data: transactions,
        };
    }
    async getTokenBalance(req) {
        const userId = req.user.id;
        const userWallet = await this.walletService.getUserWallet(userId);
        const balance = await this.fireblocksService.getTokenBalance(userWallet.walletAddress, '0.0.6800109');
        return {
            status: 'success',
            data: { balance },
        };
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getUserWallet", null);
__decorate([
    (0, common_1.Get)('balance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getWalletBalance", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, get_all_transactions_dto_1.GetTransactionsDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getWalletTransactions", null);
__decorate([
    (0, common_1.Get)('token/balance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getTokenBalance", null);
exports.WalletController = WalletController = WalletController_1 = __decorate([
    (0, common_1.Controller)('wallet'),
    __metadata("design:paramtypes", [wallet_service_1.WalletService,
        fireblocks_service_1.FireblocksService,
        transaction_service_1.TransactionService])
], WalletController);
//# sourceMappingURL=wallet.controller.js.map