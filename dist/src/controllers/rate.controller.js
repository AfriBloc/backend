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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const rate_service_1 = require("../services/rate.service");
const rate_dto_1 = require("../dto/rate.dto");
let RateController = class RateController {
    rateService;
    constructor(rateService) {
        this.rateService = rateService;
    }
    getSupportedPairs() {
        const pairs = (0, rate_dto_1.getSupportedPairs)();
        return {
            success: true,
            message: 'Supported pairs retrieved successfully',
            data: {
                pairs,
                cryptoAssets: [...rate_dto_1.CRYPTO_ASSETS],
                fiatCurrencies: [...rate_dto_1.FIAT_CURRENCIES],
            },
        };
    }
    async getRate(from, to) {
        const pairMap = {
            usdc: 'usd-coin',
            hbar: 'hedera-hashgraph',
            ngn: 'ngn',
            usd: 'usd',
        };
        const mappedFrom = pairMap[from.toLowerCase()] || from.toLowerCase();
        const mappedTo = pairMap[to.toLowerCase()] || to.toLowerCase();
        const rate = await this.rateService.getRate(mappedFrom, mappedTo);
        return {
            success: true,
            message: 'Exchange rate retrieved successfully',
            data: rate,
        };
    }
    async getQuote(request) {
        const quote = await this.rateService.getQuote(request);
        return {
            success: true,
            message: 'Quote generated successfully',
            data: quote,
        };
    }
    async updateRate(from, to) {
        const rate = await this.rateService.updateRate(from.toLowerCase(), to.toLowerCase());
        return {
            success: true,
            message: 'Rate updated successfully',
            data: rate,
        };
    }
};
exports.RateController = RateController;
__decorate([
    (0, common_1.Get)('supported-pairs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RateController.prototype, "getSupportedPairs", null);
__decorate([
    (0, common_1.Get)(':from/:to'),
    __param(0, (0, common_1.Param)('from')),
    __param(1, (0, common_1.Param)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RateController.prototype, "getRate", null);
__decorate([
    (0, common_1.Post)('quote'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rate_dto_1.GetQuoteRequestDto]),
    __metadata("design:returntype", Promise)
], RateController.prototype, "getQuote", null);
__decorate([
    (0, common_1.Post)('update/:from/:to'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('from')),
    __param(1, (0, common_1.Param)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RateController.prototype, "updateRate", null);
exports.RateController = RateController = __decorate([
    (0, common_1.Controller)('rates'),
    __metadata("design:paramtypes", [rate_service_1.RateService])
], RateController);
//# sourceMappingURL=rate.controller.js.map