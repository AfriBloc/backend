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
var RateService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const cache_service_1 = require("./cache.service");
const rate_dto_1 = require("../dto/rate.dto");
const coingecko_service_1 = require("./coingecko.service");
let RateService = RateService_1 = class RateService {
    coingeckoService;
    cacheService;
    logger = new common_1.Logger(RateService_1.name);
    constructor(coingeckoService, cacheService) {
        this.coingeckoService = coingeckoService;
        this.cacheService = cacheService;
    }
    async getRate(from, to) {
        if (!(0, rate_dto_1.isValidRatePair)(from, to)) {
            throw new common_1.BadRequestException(`Unsupported currency pair: ${from}/${to}`);
        }
        const cacheKey = `rate:${from}:${to}`;
        try {
            const cachedRate = await this.cacheService.get(cacheKey);
            if (cachedRate) {
                this.logger.log(`Rate found in cache for ${from}/${to}`);
                return cachedRate;
            }
            this.logger.log(`Rate not in cache, fetching fresh rate for ${from}/${to}`);
            const freshRate = await this.fetchRate(from, to);
            await this.cacheService.set(cacheKey, freshRate, cache_service_1.TTL.ONE_HOUR);
            return freshRate;
        }
        catch (error) {
            this.logger.error(`Error getting rate for ${from}/${to}:`, error);
            throw new common_1.BadRequestException(`Failed to get rate for ${from}/${to}: ${error.message}`);
        }
    }
    async getQuote(request) {
        const { from, to } = request;
        if (!(0, rate_dto_1.isValidRatePair)(from, to)) {
            throw new common_1.BadRequestException(`Unsupported currency pair: ${from}/${to}`);
        }
        try {
            this.logger.log(`Getting live quote for ${from}/${to}`);
            if (this.isCryptoToFiat(from, to)) {
                return await this.getCryptoToFiatQuote({
                    fromAsset: from,
                    toCurrency: to,
                });
            }
            else {
                throw new common_1.BadRequestException(`Unsupported conversion type: ${from}/${to}`);
            }
        }
        catch (error) {
            this.logger.error(`Error getting quote for ${from}/${to}:`, error);
            throw new common_1.BadRequestException(`Failed to get quote for ${from}/${to}: ${error.message}`);
        }
    }
    async fetchRate(from, to) {
        try {
            if (this.isCryptoToFiat(from, to)) {
                const pairMap = {
                    'usd-coin': 'usdc',
                    'hedera-hashgraph': 'hbar',
                    ngn: 'ngn',
                    usd: 'usd',
                };
                const quote = await this.getCryptoToFiatQuote({
                    fromAsset: from,
                    toCurrency: to,
                });
                return {
                    from: pairMap[from],
                    to: pairMap[to],
                    rate: quote.rate,
                };
            }
            else {
                throw new common_1.InternalServerErrorException(`Unsupported conversion type: ${from}/${to}`);
            }
        }
        catch (error) {
            this.logger.error(`Error fetching rate for ${from}/${to}:`, error);
            throw error;
        }
    }
    async getCryptoToFiatQuote(params) {
        const price = await this.coingeckoService.getCryptoToFiatQuote(params.fromAsset, params.toCurrency);
        return {
            from: params.fromAsset,
            to: params.toCurrency.toLowerCase(),
            rate: price,
        };
    }
    isCryptoToFiat(from, to) {
        return (rate_dto_1.CRYPTO_ASSETS.includes(from) && rate_dto_1.FIAT_CURRENCIES.includes(to));
    }
    async updateAllCachedRates() {
        this.logger.log('Starting hourly rate update job');
        const pairs = [
            { from: 'hedera-hashgraph', to: 'ngn' },
            { from: 'hedera-hashgraph', to: 'usd' },
            { from: 'usd-coin', to: 'ngn' },
            { from: 'usd-coin', to: 'usd' },
            { from: 'usd', to: 'ngn' },
        ];
        let successCount = 0;
        let errorCount = 0;
        for (const pair of pairs) {
            try {
                const cacheKey = `rate:${pair.from}:${pair.to}`;
                const rate = await this.fetchRate(pair.from, pair.to);
                await this.cacheService.set(cacheKey, rate, cache_service_1.TTL.ONE_HOUR);
                successCount++;
                this.logger.log(`Updated rate for ${pair.from}/${pair.to}`);
                await new Promise((resolve) => setTimeout(resolve, 500));
            }
            catch (error) {
                errorCount++;
                this.logger.error(`Failed to update rate for ${pair.from}/${pair.to}:`, error);
            }
        }
        this.logger.log(`Rate update job completed. Success: ${successCount}, Errors: ${errorCount}`);
    }
    async updateRate(from, to) {
        if (!(0, rate_dto_1.isValidRatePair)(from, to)) {
            throw new common_1.BadRequestException(`Unsupported currency pair: ${from}/${to}`);
        }
        try {
            const cacheKey = `rate:${from}:${to}`;
            const rate = await this.fetchRate(from, to);
            await this.cacheService.set(cacheKey, rate, cache_service_1.TTL.ONE_HOUR);
            this.logger.log(`Manually updated rate for ${from}/${to}`);
            return rate;
        }
        catch (error) {
            this.logger.error(`Error updating rate for ${from}/${to}:`, error);
            throw new common_1.BadRequestException(`Failed to update rate for ${from}/${to}: ${error.message}`);
        }
    }
};
exports.RateService = RateService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RateService.prototype, "updateAllCachedRates", null);
exports.RateService = RateService = RateService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [coingecko_service_1.CoingeckoService,
        cache_service_1.CacheService])
], RateService);
//# sourceMappingURL=rate.service.js.map