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
var PortfolioItemService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioItemService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const property_portfolio_item_entity_1 = require("../entities/property-portfolio-item.entity");
const user_wallet_entity_1 = require("../entities/user-wallet.entity");
let PortfolioItemService = PortfolioItemService_1 = class PortfolioItemService {
    portfolioRepo;
    logger = new common_1.Logger(PortfolioItemService_1.name);
    constructor(portfolioRepo) {
        this.portfolioRepo = portfolioRepo;
    }
    async list(userId, limit = 10, offset = 1) {
        const query = this.portfolioRepo
            .createQueryBuilder('PortfolioItem')
            .leftJoinAndSelect('PortfolioItem.user', 'user')
            .leftJoinAndSelect('PortfolioItem.property', 'property')
            .where('PortfolioItem.userId = :userId', { userId })
            .orderBy('PortfolioItem.createdAt', 'DESC')
            .take(limit)
            .skip(limit * ((offset ?? 1) - 1));
        const totals = await this.portfolioRepo
            .createQueryBuilder('PortfolioItem')
            .select('COALESCE(SUM("PortfolioItem"."total_invested"), 0)::numeric', 'totalInvested')
            .addSelect('COALESCE(SUM("PortfolioItem"."yield"), 0)::numeric', 'totalYield')
            .where('"PortfolioItem"."user_id" = :userId', { userId })
            .getRawOne();
        const [items, totalCount] = await query.getManyAndCount();
        const totalPages = Math.ceil(totalCount / limit);
        const totalPortfolio = Number(totals.totalInvested) + Number(totals.totalYield);
        return {
            currentPage: offset,
            pageSize: limit,
            totalCount: totalCount,
            totalPages: totalPages,
            items,
            totals: {
                currency: user_wallet_entity_1.Currency.NGN,
                totalPortfolio: totalPortfolio.toFixed(2),
                totalIncome: totals.totalYield ?? '0',
            },
        };
    }
};
exports.PortfolioItemService = PortfolioItemService;
exports.PortfolioItemService = PortfolioItemService = PortfolioItemService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(property_portfolio_item_entity_1.PortfolioItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PortfolioItemService);
//# sourceMappingURL=portfolio-item.service.js.map