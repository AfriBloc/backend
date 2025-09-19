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
exports.Property = void 0;
const typeorm_1 = require("typeorm");
const property_portfolio_item_entity_1 = require("./property-portfolio-item.entity");
const user_wallet_entity_1 = require("./user-wallet.entity");
let Property = class Property {
    id;
    title;
    description;
    type;
    kitchen;
    dining;
    bedrooms;
    livingRoom;
    bathroom;
    landMeasurement;
    location;
    pricePerUnit;
    numUnits;
    propertyPrice;
    purchaseCosts;
    transactionFees;
    mofFees;
    listingPrice;
    initialUnits;
    investorsCount;
    unitsSold;
    netRentalYieldPct;
    annualisedRoiPct;
    grossRentalYieldPct;
    fundedDate;
    features;
    amenities;
    whyInvest;
    imageUrls;
    currency;
    governorsConsentUrl;
    deedOfAssignmentUrl;
    surveyPlanUrl;
    tokenId;
    tokenSymbol;
    portfolioItems;
    createdAt;
    updatedAt;
};
exports.Property = Property;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Property.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Property.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Property.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Property.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'kitchen', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Property.prototype, "kitchen", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dining', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Property.prototype, "dining", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bedrooms', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Property.prototype, "bedrooms", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'living_room', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Property.prototype, "livingRoom", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bathroom', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Property.prototype, "bathroom", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'land_measurement', type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Property.prototype, "landMeasurement", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Property.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price_per_unit', type: 'numeric', precision: 18, scale: 2 }),
    __metadata("design:type", String)
], Property.prototype, "pricePerUnit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'num_units', type: 'int' }),
    __metadata("design:type", Number)
], Property.prototype, "numUnits", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'property_price', type: 'numeric', precision: 18, scale: 2 }),
    __metadata("design:type", String)
], Property.prototype, "propertyPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'purchase_costs', type: 'numeric', precision: 18, scale: 2 }),
    __metadata("design:type", String)
], Property.prototype, "purchaseCosts", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'transaction_fees',
        type: 'numeric',
        precision: 18,
        scale: 2,
    }),
    __metadata("design:type", String)
], Property.prototype, "transactionFees", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mof_fees', type: 'numeric', precision: 18, scale: 2 }),
    __metadata("design:type", String)
], Property.prototype, "mofFees", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_cost', type: 'numeric', precision: 18, scale: 2 }),
    __metadata("design:type", String)
], Property.prototype, "listingPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'initial_units', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Property.prototype, "initialUnits", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'investors_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Property.prototype, "investorsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'units_sold', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Property.prototype, "unitsSold", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'net_rental_yield_pct',
        type: 'numeric',
        precision: 5,
        scale: 2,
    }),
    __metadata("design:type", String)
], Property.prototype, "netRentalYieldPct", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'annualised_roi_pct',
        type: 'numeric',
        precision: 5,
        scale: 2,
    }),
    __metadata("design:type", String)
], Property.prototype, "annualisedRoiPct", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'gross_rental_yield_pct',
        type: 'numeric',
        precision: 5,
        scale: 2,
    }),
    __metadata("design:type", String)
], Property.prototype, "grossRentalYieldPct", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'funded_date', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Property.prototype, "fundedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'features',
        type: 'text',
        array: true,
        default: [],
        nullable: true,
    }),
    __metadata("design:type", Object)
], Property.prototype, "features", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'amenities',
        type: 'text',
        array: true,
        default: [],
        nullable: true,
    }),
    __metadata("design:type", Object)
], Property.prototype, "amenities", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'why_invest',
        type: 'text',
        array: true,
        default: [],
        nullable: true,
    }),
    __metadata("design:type", Object)
], Property.prototype, "whyInvest", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'image_urls', type: 'text', array: true, nullable: true }),
    __metadata("design:type", Object)
], Property.prototype, "imageUrls", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'currency',
        type: 'enum',
        enum: user_wallet_entity_1.Currency,
        default: user_wallet_entity_1.Currency.NGN,
    }),
    __metadata("design:type", String)
], Property.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'governors_consent_url',
        type: 'varchar',
        length: 500,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Property.prototype, "governorsConsentUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'deed_of_assignment_url',
        type: 'varchar',
        length: 500,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Property.prototype, "deedOfAssignmentUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'survey_plan_url',
        type: 'varchar',
        length: 500,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Property.prototype, "surveyPlanUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'token_id', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], Property.prototype, "tokenId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'token_symbol',
        type: 'varchar',
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Property.prototype, "tokenSymbol", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => property_portfolio_item_entity_1.PortfolioItem, (item) => item.property),
    __metadata("design:type", Array)
], Property.prototype, "portfolioItems", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Property.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Property.prototype, "updatedAt", void 0);
exports.Property = Property = __decorate([
    (0, typeorm_1.Entity)('properties')
], Property);
//# sourceMappingURL=property.entity.js.map