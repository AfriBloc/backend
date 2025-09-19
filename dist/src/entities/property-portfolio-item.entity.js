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
exports.PortfolioItem = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const property_entity_1 = require("./property.entity");
const user_wallet_entity_1 = require("./user-wallet.entity");
let PortfolioItem = class PortfolioItem {
    id;
    userId;
    propertyId;
    currency;
    user;
    property;
    totalInvested;
    yield;
    unitsOwned;
    createdAt;
    updatedAt;
};
exports.PortfolioItem = PortfolioItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PortfolioItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'varchar' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PortfolioItem.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'property_id', type: 'varchar' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PortfolioItem.prototype, "propertyId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'currency',
        type: 'enum',
        enum: user_wallet_entity_1.Currency,
        default: user_wallet_entity_1.Currency.NGN,
    }),
    __metadata("design:type", String)
], PortfolioItem.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], PortfolioItem.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => property_entity_1.Property, (property) => property.portfolioItems, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'property_id' }),
    __metadata("design:type", property_entity_1.Property)
], PortfolioItem.prototype, "property", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'total_invested',
        type: 'numeric',
        precision: 20,
        scale: 8,
        nullable: true,
    }),
    __metadata("design:type", String)
], PortfolioItem.prototype, "totalInvested", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'yield',
        type: 'numeric',
        precision: 20,
        scale: 8,
        nullable: true,
    }),
    __metadata("design:type", String)
], PortfolioItem.prototype, "yield", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'units_owned', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], PortfolioItem.prototype, "unitsOwned", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PortfolioItem.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PortfolioItem.prototype, "updatedAt", void 0);
exports.PortfolioItem = PortfolioItem = __decorate([
    (0, typeorm_1.Entity)('property_portfolio_items'),
    (0, typeorm_1.Unique)('uq_user_property', ['userId', 'propertyId'])
], PortfolioItem);
//# sourceMappingURL=property-portfolio-item.entity.js.map