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
var PropertiesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertiesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const property_entity_1 = require("../entities/property.entity");
const property_portfolio_item_entity_1 = require("../entities/property-portfolio-item.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
const fireblocks_service_1 = require("./fireblocks.service");
const wallet_service_1 = require("./wallet.service");
const rate_service_1 = require("./rate.service");
const transaction_entity_1 = require("../entities/transaction.entity");
const transaction_reference_service_1 = require("./transaction-reference.service");
const user_wallet_entity_1 = require("../entities/user-wallet.entity");
const mail_service_1 = require("./mail.service");
let PropertiesService = PropertiesService_1 = class PropertiesService {
    propertyRepo;
    portfolioRepo;
    dataSource;
    eventEmitter;
    fireblocksService;
    walletService;
    rateService;
    mailService;
    transactionRefService;
    logger = new common_1.Logger(PropertiesService_1.name);
    constructor(propertyRepo, portfolioRepo, dataSource, eventEmitter, fireblocksService, walletService, rateService, mailService, transactionRefService) {
        this.propertyRepo = propertyRepo;
        this.portfolioRepo = portfolioRepo;
        this.dataSource = dataSource;
        this.eventEmitter = eventEmitter;
        this.fireblocksService = fireblocksService;
        this.walletService = walletService;
        this.rateService = rateService;
        this.mailService = mailService;
        this.transactionRefService = transactionRefService;
    }
    async list() {
        const properties = await this.propertyRepo.find({
            relations: ['portfolioItems'],
        });
        for (const property of properties) {
            const investorsCount = property.portfolioItems.length;
            const unitsSold = property.portfolioItems.reduce((sum, item) => sum + (item.unitsOwned || 0), 0);
            const initialUnits = unitsSold + property.numUnits;
            property.investorsCount = investorsCount;
            property.unitsSold = unitsSold;
            property.initialUnits = initialUnits;
            await this.propertyRepo.save(property);
        }
        return properties;
    }
    async getById(id) {
        const property = await this.propertyRepo.findOne({
            where: { id },
        });
        if (!property)
            throw new common_1.NotFoundException('Property not found');
        return property;
    }
    async createFull(propertyDto) {
        return await this.dataSource.transaction(async (manager) => {
            const costs = this.computeUnitCosts(propertyDto.propertyPrice ?? 0, propertyDto.purchasePct ?? 5, propertyDto.transactionPct ?? 5, propertyDto.mofPct ?? 3);
            const property = this.propertyRepo.create({
                ...propertyDto,
                features: propertyDto.features ?? null,
                amenities: propertyDto.amenities ?? null,
                whyInvest: propertyDto.whyInvest ?? null,
                imageUrls: propertyDto.imageUrls ?? null,
                governorsConsentUrl: propertyDto.governorsConsentUrl ?? null,
                deedOfAssignmentUrl: propertyDto.deedOfAssignmentUrl ?? null,
                surveyPlanUrl: propertyDto.surveyPlanUrl ?? null,
                numUnits: propertyDto.numUnits ?? 0,
                pricePerUnit: this.toMoneyString(Number(costs.totalCost) / Number(propertyDto.numUnits ?? 1)),
                purchaseCosts: costs.purchaseCosts,
                transactionFees: costs.transactionFees,
                mofFees: costs.mofFees,
                listingPrice: costs.totalCost,
            });
            const savedProperty = await manager.save(property_entity_1.Property, property);
            this.eventEmitter.emit('property.created', savedProperty);
            return savedProperty;
        });
    }
    parseMoney(value) {
        if (typeof value === 'number')
            return value;
        const cleaned = value.replace(/[^0-9.]/g, '');
        const parsed = parseFloat(cleaned || '0');
        return isNaN(parsed) ? 0 : parsed;
    }
    toMoneyString(value) {
        return value.toFixed(2);
    }
    computeUnitCosts(propertyPrice, purchasePct = 5, transactionPct = 5, mofPct = 3) {
        const price = this.parseMoney(propertyPrice);
        const purchase = (purchasePct / 100) * price;
        const transaction = (transactionPct / 100) * price;
        const mof = (mofPct / 100) * price;
        const total = price + purchase + transaction + mof;
        return {
            propertyPrice: this.toMoneyString(price),
            purchaseCosts: this.toMoneyString(purchase),
            transactionFees: this.toMoneyString(transaction),
            mofFees: this.toMoneyString(mof),
            totalCost: this.toMoneyString(total),
        };
    }
    async purchasePropertyUnits(user, propertyId, numUnits) {
        return await this.dataSource.transaction(async (manager) => {
            let property = await manager.findOne(property_entity_1.Property, {
                where: { id: propertyId },
            });
            if (!property)
                throw new common_1.NotFoundException('Property not found');
            if (property.numUnits < numUnits) {
                throw new common_1.BadRequestException('Not enough units available');
            }
            if (!property.tokenId) {
                throw new common_1.BadRequestException('Property token not yet created');
            }
            const userWallet = await this.walletService.getUserWallet(user.id);
            if (!userWallet?.walletAddress) {
                throw new common_1.BadRequestException('User wallet not found');
            }
            const price = Number(property.pricePerUnit) * numUnits;
            const totalPrice = Number(price.toFixed(2));
            const hbarRate = await this.rateService.getRate('hedera-hashgraph', 'ngn');
            if (!hbarRate?.rate || Number(hbarRate.rate) <= 0) {
                throw new common_1.BadRequestException('Invalid HBAR/NGN rate');
            }
            const totalPriceInHbar = totalPrice / Number(hbarRate.rate);
            const userBalance = await this.walletService.getWalletBalance(user.id);
            if (userBalance.hbar < totalPriceInHbar) {
                throw new common_1.BadRequestException('Insufficient wallet balance');
            }
            this.logger.log(`User ${user.id} purchasing ${numUnits} units of property ${propertyId}`);
            this.logger.log(`Total price: ${totalPrice.toFixed()} NGN (${totalPriceInHbar.toFixed()} HBAR)`);
            const portfolioItem = await this.portfolioRepo.findOne({
                where: { userId: user.id, propertyId },
                relations: ['property'],
            });
            if (!portfolioItem) {
                try {
                    const associationStatus = await this.fireblocksService.associateTokenWithVault(userWallet.vaultId, userWallet.walletAddress, property.tokenId);
                    this.logger.log(`Token association: ${JSON.stringify(associationStatus)}`);
                }
                catch (err) {
                    if (!err.message.includes('TOKEN_ALREADY_ASSOCIATED')) {
                        throw err;
                    }
                    this.logger.warn(`Token already associated for ${userWallet.walletAddress}`);
                }
            }
            const reference = this.transactionRefService.generate();
            let transactionLeg = manager.create(transaction_entity_1.Transaction, {
                userId: user.id,
                walletType: userWallet.walletType,
                transactionType: transaction_entity_1.TransactionType.DEBIT,
                status: transaction_entity_1.TransactionStatus.PENDING,
                amount: totalPriceInHbar.toFixed(8),
                reference,
                currency: user_wallet_entity_1.Currency.HBAR,
                address: userWallet.walletAddress,
                network: userWallet.networkType,
                spotPrice: Number(hbarRate.rate),
                description: `Purchase of ${numUnits} units of property ${propertyId}`,
            });
            await manager.save(transactionLeg);
            try {
                const transferResult = await this.fireblocksService.grantAndTransfer(userWallet.walletAddress, userWallet.vaultId, property.tokenId, Number(totalPriceInHbar), transactionLeg, numUnits);
                transactionLeg.status = transaction_entity_1.TransactionStatus.SUCCESS;
                transactionLeg.fireblockTransactionId =
                    transferResult?.transactionId ?? null;
                transactionLeg.hash = transferResult?.transactionHash ?? null;
                transactionLeg = await manager.save(transactionLeg);
                property.numUnits -= numUnits;
                property.unitsSold += numUnits;
                property = await manager.save(property);
                this.eventEmitter.emit('property.sold', {
                    property,
                    userId: user.id,
                    numUnits,
                    totalPrice,
                });
                this.mailService.sendPropertyPurchasedEmail(transactionLeg, property, user, totalPrice, numUnits);
                this.logger.log(`Transfer result: ${JSON.stringify(transferResult)}`);
                return {
                    message: 'Purchase successful',
                    transaction: transactionLeg,
                };
            }
            catch (error) {
                transactionLeg.status = transaction_entity_1.TransactionStatus.FAILED;
                await manager.save(transactionLeg);
                throw error;
            }
        });
    }
};
exports.PropertiesService = PropertiesService;
exports.PropertiesService = PropertiesService = PropertiesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(property_entity_1.Property)),
    __param(1, (0, typeorm_1.InjectRepository)(property_portfolio_item_entity_1.PortfolioItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        event_emitter_1.EventEmitter2,
        fireblocks_service_1.FireblocksService,
        wallet_service_1.WalletService,
        rate_service_1.RateService,
        mail_service_1.MailService,
        transaction_reference_service_1.TransactionReferenceService])
], PropertiesService);
//# sourceMappingURL=properties.service.js.map