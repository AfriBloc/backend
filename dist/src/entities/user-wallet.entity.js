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
exports.UserWallet = exports.NetworkType = exports.Currency = exports.WalletType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
var WalletType;
(function (WalletType) {
    WalletType["HEDERA"] = "HEDERA";
})(WalletType || (exports.WalletType = WalletType = {}));
var Currency;
(function (Currency) {
    Currency["HBAR"] = "HBAR";
    Currency["USD"] = "USD";
    Currency["NGN"] = "NGN";
})(Currency || (exports.Currency = Currency = {}));
var NetworkType;
(function (NetworkType) {
    NetworkType["MAINNET"] = "mainnet";
    NetworkType["TESTNET"] = "testnet";
})(NetworkType || (exports.NetworkType = NetworkType = {}));
let UserWallet = class UserWallet {
    id;
    walletAddress;
    evmAddress;
    isActive;
    walletType;
    networkType;
    asset;
    currency;
    vaultId;
    balance;
    userId;
    user;
    createdAt;
    updatedAt;
};
exports.UserWallet = UserWallet;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserWallet.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'wallet_address', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], UserWallet.prototype, "walletAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'evm_address', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], UserWallet.prototype, "evmAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], UserWallet.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'wallet_type',
        type: 'enum',
        enum: WalletType,
        default: WalletType.HEDERA,
    }),
    __metadata("design:type", String)
], UserWallet.prototype, "walletType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'network_type',
        type: 'enum',
        enum: NetworkType,
        default: NetworkType.MAINNET,
    }),
    __metadata("design:type", String)
], UserWallet.prototype, "networkType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], UserWallet.prototype, "asset", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'currency',
        type: 'enum',
        enum: Currency,
        default: Currency.HBAR,
    }),
    __metadata("design:type", String)
], UserWallet.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vault_id', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], UserWallet.prototype, "vaultId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 8, default: 0 }),
    __metadata("design:type", Number)
], UserWallet.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], UserWallet.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.wallets),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], UserWallet.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], UserWallet.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], UserWallet.prototype, "updatedAt", void 0);
exports.UserWallet = UserWallet = __decorate([
    (0, typeorm_1.Entity)('user_wallets')
], UserWallet);
//# sourceMappingURL=user-wallet.entity.js.map