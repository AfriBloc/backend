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
var PropertyCreationListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyCreationListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_1 = require("@nestjs/typeorm");
const property_entity_1 = require("../entities/property.entity");
const fireblocks_service_1 = require("../services/fireblocks.service");
const typeorm_2 = require("typeorm");
let PropertyCreationListener = PropertyCreationListener_1 = class PropertyCreationListener {
    fireblocksService;
    propertyRepo;
    logger = new common_1.Logger(PropertyCreationListener_1.name);
    constructor(fireblocksService, propertyRepo) {
        this.fireblocksService = fireblocksService;
        this.propertyRepo = propertyRepo;
    }
    async handlePropertyCreatedEvent(event) {
        try {
            this.logger.log(`Handling property creation event for property ID: ${event.id}`);
            const data = await this.fireblocksService.createFungibleKycToken(event);
            this.logger.log(`Successfully created token with ID: ${data.tokenId}`);
            event.tokenId = data.tokenId;
            event.tokenSymbol = data.symbol;
            await this.propertyRepo.save(event);
        }
        catch (error) {
            this.logger.error('Error handling property creation event:', error);
        }
    }
};
exports.PropertyCreationListener = PropertyCreationListener;
__decorate([
    (0, event_emitter_1.OnEvent)('property.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [property_entity_1.Property]),
    __metadata("design:returntype", Promise)
], PropertyCreationListener.prototype, "handlePropertyCreatedEvent", null);
exports.PropertyCreationListener = PropertyCreationListener = PropertyCreationListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(property_entity_1.Property)),
    __metadata("design:paramtypes", [fireblocks_service_1.FireblocksService,
        typeorm_2.Repository])
], PropertyCreationListener);
//# sourceMappingURL=property-creation.listener.js.map