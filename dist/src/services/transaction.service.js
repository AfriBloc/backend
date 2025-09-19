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
var TransactionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const transaction_entity_1 = require("../entities/transaction.entity");
const wallet_service_1 = require("./wallet.service");
const class_transformer_1 = require("class-transformer");
let TransactionService = TransactionService_1 = class TransactionService {
    transactionRepository;
    walletService;
    eventEmitter;
    logger = new common_1.Logger(TransactionService_1.name);
    constructor(transactionRepository, walletService, eventEmitter) {
        this.transactionRepository = transactionRepository;
        this.walletService = walletService;
        this.eventEmitter = eventEmitter;
    }
    async getUserTransactions(userId, limit = 20, offset = 1, walletType) {
        const query = this.transactionRepository
            .createQueryBuilder('transaction')
            .where('transaction.userId = :userId', { userId })
            .orderBy('transaction.createdAt', 'DESC')
            .take(limit)
            .skip(limit * ((offset ?? 1) - 1));
        if (walletType) {
            query.andWhere('transaction.walletType = :walletType', { walletType });
        }
        const [transactions, totalCount] = await query.getManyAndCount();
        const totalPages = Math.ceil(totalCount / limit);
        return {
            currentPage: offset,
            pageSize: limit,
            totalCount: totalCount,
            totalPages: totalPages,
            transactions: (0, class_transformer_1.instanceToPlain)(transactions),
        };
    }
    async getTransactionByIdAndUserId(transactionId, userId) {
        return this.transactionRepository.findOne({
            where: { id: transactionId, userId },
        });
    }
};
exports.TransactionService = TransactionService;
exports.TransactionService = TransactionService = TransactionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        wallet_service_1.WalletService,
        event_emitter_1.EventEmitter2])
], TransactionService);
//# sourceMappingURL=transaction.service.js.map