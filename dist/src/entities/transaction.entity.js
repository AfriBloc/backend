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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = exports.TransactionStatus = exports.TransactionType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const user_wallet_entity_1 = require("./user-wallet.entity");
var TransactionType;
(function (TransactionType) {
    TransactionType["DEBIT"] = "debit";
    TransactionType["CREDIT"] = "credit";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["SUCCESS"] = "success";
    TransactionStatus["FAILED"] = "failed";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
let Transaction = class Transaction {
    id;
    userId;
    walletType;
    transactionType;
    status;
    amount;
    fees;
    currency;
    reference;
    fireblockTransactionId;
    description;
    hash;
    address;
    network;
    spotPrice;
    createdAt;
    updatedAt;
    user;
};
exports.Transaction = Transaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Transaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'varchar' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Transaction.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'wallet_type', type: 'enum', enum: user_wallet_entity_1.WalletType }),
    __metadata("design:type", String)
], Transaction.prototype, "walletType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_type', type: 'enum', enum: TransactionType }),
    __metadata("design:type", String)
], Transaction.prototype, "transactionType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: TransactionStatus,
        default: TransactionStatus.PENDING,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Transaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'amount', type: 'numeric', precision: 20, scale: 8 }),
    __metadata("design:type", String)
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'fees',
        type: 'numeric',
        precision: 20,
        scale: 8,
        default: 0,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "fees", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency', type: 'enum', enum: user_wallet_entity_1.Currency }),
    __metadata("design:type", String)
], Transaction.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reference', type: 'varchar', unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Transaction.prototype, "reference", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fireblock_transaction_id', nullable: true, type: 'varchar' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Object)
], Transaction.prototype, "fireblockTransactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'description', nullable: true, type: 'text' }),
    __metadata("design:type", Object)
], Transaction.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hash', nullable: true, type: 'varchar' }),
    __metadata("design:type", Object)
], Transaction.prototype, "hash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address', nullable: true, type: 'varchar' }),
    __metadata("design:type", Object)
], Transaction.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'network', type: 'enum', enum: user_wallet_entity_1.NetworkType }),
    __metadata("design:type", String)
], Transaction.prototype, "network", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'spot_price',
        nullable: true,
        type: 'decimal',
        precision: 10,
        scale: 2,
    }),
    __metadata("design:type", Object)
], Transaction.prototype, "spotPrice", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Transaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Transaction.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Transaction.prototype, "user", void 0);
exports.Transaction = Transaction = __decorate([
    (0, typeorm_1.Entity)('transactions')
], Transaction);
//# sourceMappingURL=transaction.entity.js.map