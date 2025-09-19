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
exports.CoingeckoService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let CoingeckoService = class CoingeckoService {
    httpService;
    config;
    constructor(httpService, config) {
        this.httpService = httpService;
        this.config = config;
    }
    async getCryptoToFiatQuote(fromAsset, toCurrency) {
        const baseUrl = 'https://api.coingecko.com/api/v3';
        const url = `${baseUrl}/simple/price?ids=${fromAsset}&vs_currencies=${toCurrency}&x_cg_demo_api_key=${this.config.get('coingecko.apiKey')}`;
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url));
            const price = response.data[fromAsset][toCurrency];
            return price;
        }
        catch (error) {
            console.log(error);
            throw new common_1.InternalServerErrorException(`Failed to fetch rate from CoinGecko: ${error.message}`);
        }
    }
};
exports.CoingeckoService = CoingeckoService;
exports.CoingeckoService = CoingeckoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], CoingeckoService);
//# sourceMappingURL=coingecko.service.js.map