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
exports.RateErrorResponseDto = exports.GetQuoteResponseDto = exports.GetQuoteRequestDto = exports.GetRateResponseDto = exports.ALL_CURRENCIES = exports.FIAT_CURRENCIES = exports.CRYPTO_ASSETS = void 0;
exports.isValidRatePair = isValidRatePair;
exports.getSupportedPairs = getSupportedPairs;
const class_validator_1 = require("class-validator");
exports.CRYPTO_ASSETS = ['usd-coin', 'usd', 'hedera-hashgraph'];
exports.FIAT_CURRENCIES = ['usd', 'ngn'];
exports.ALL_CURRENCIES = [...exports.CRYPTO_ASSETS, ...exports.FIAT_CURRENCIES];
class GetRateResponseDto {
    success;
    message;
    data;
}
exports.GetRateResponseDto = GetRateResponseDto;
class GetQuoteRequestDto {
    from;
    to;
    amount;
}
exports.GetQuoteRequestDto = GetQuoteRequestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(exports.CRYPTO_ASSETS),
    __metadata("design:type", String)
], GetQuoteRequestDto.prototype, "from", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(exports.ALL_CURRENCIES),
    __metadata("design:type", String)
], GetQuoteRequestDto.prototype, "to", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1, { message: 'Amount must be greater than 0' }),
    (0, class_validator_1.ValidateIf)((o) => !o.settlementAmount),
    __metadata("design:type", Number)
], GetQuoteRequestDto.prototype, "amount", void 0);
class GetQuoteResponseDto {
    success;
    message;
    data;
}
exports.GetQuoteResponseDto = GetQuoteResponseDto;
class RateErrorResponseDto {
    success;
    message;
    code;
}
exports.RateErrorResponseDto = RateErrorResponseDto;
function isValidRatePair(from, to) {
    const fromValid = exports.ALL_CURRENCIES.includes(from);
    const toValid = exports.ALL_CURRENCIES.includes(to);
    if (!fromValid || !toValid || from === to) {
        return false;
    }
    const fromIsCrypto = exports.CRYPTO_ASSETS.includes(from);
    const toIsCrypto = exports.CRYPTO_ASSETS.includes(to);
    if (!fromIsCrypto || (toIsCrypto && to !== 'usd')) {
        return false;
    }
    return true;
}
function getSupportedPairs() {
    const pairs = [];
    for (const from of exports.CRYPTO_ASSETS) {
        for (const to of exports.ALL_CURRENCIES) {
            if (isValidRatePair(from, to)) {
                pairs.push({ from, to });
            }
        }
    }
    return pairs;
}
//# sourceMappingURL=rate.dto.js.map