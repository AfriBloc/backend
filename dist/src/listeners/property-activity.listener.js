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
var PropertyActivityListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyActivityListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_1 = require("@nestjs/typeorm");
const property_portfolio_item_entity_1 = require("../entities/property-portfolio-item.entity");
const property_entity_1 = require("../entities/property.entity");
const typeorm_2 = require("typeorm");
let PropertyActivityListener = PropertyActivityListener_1 = class PropertyActivityListener {
    portfolioItemRepo;
    propertyRepo;
    logger = new common_1.Logger(PropertyActivityListener_1.name);
    constructor(portfolioItemRepo, propertyRepo) {
        this.portfolioItemRepo = portfolioItemRepo;
        this.propertyRepo = propertyRepo;
    }
    async handlePropertySoldEvent(event) {
        try {
            this.logger.log(`Handling property sold event for property ID: ${event.property.id}`);
            let portfolioItem = await this.portfolioItemRepo.findOne({
                where: { userId: event.userId, property: { id: event.property.id } },
                relations: ['property'],
            });
            if (portfolioItem) {
                portfolioItem.unitsOwned += event.numUnits;
                portfolioItem.totalInvested += event.totalPrice;
                portfolioItem = await this.portfolioItemRepo.save(portfolioItem);
            }
            else {
                portfolioItem = await this.portfolioItemRepo.save({
                    userId: event.userId,
                    property: event.property,
                    unitsOwned: event.numUnits,
                    totalInvested: event.totalPrice.toString(),
                });
                event.property.investorsCount += 1;
                await this.propertyRepo.save(event.property);
            }
            return portfolioItem;
        }
        catch (error) {
            this.logger.error('Error handling property sold event:', error);
        }
    }
};
exports.PropertyActivityListener = PropertyActivityListener;
__decorate([
    (0, event_emitter_1.OnEvent)('property.sold'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PropertyActivityListener.prototype, "handlePropertySoldEvent", null);
exports.PropertyActivityListener = PropertyActivityListener = PropertyActivityListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(property_portfolio_item_entity_1.PortfolioItem)),
    __param(1, (0, typeorm_1.InjectRepository)(property_entity_1.Property)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PropertyActivityListener);
//# sourceMappingURL=property-activity.listener.js.map