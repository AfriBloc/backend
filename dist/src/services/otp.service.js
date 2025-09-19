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
exports.OtpService = void 0;
const common_1 = require("@nestjs/common");
const cache_service_1 = require("./cache.service");
let OtpService = class OtpService {
    cache;
    constructor(cache) {
        this.cache = cache;
    }
    async generateFor(identifier) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await this.cache.set(`otp:${code}`, identifier, cache_service_1.TTL.FIVE_MINUTES);
        await this.cache.set(`user_otp:${identifier}`, code, cache_service_1.TTL.FIVE_MINUTES);
        return code;
    }
    async verify(code, identifier) {
        const cachedUser = await this.cache.get(`otp:${code}`);
        return cachedUser === identifier;
    }
    async invalidate(code, identifier) {
        await this.cache.del(`otp:${code}`);
        await this.cache.del(`user_otp:${identifier}`);
    }
    async getOtpByUserIdentifier(identifier) {
        return await this.cache.get(`user_otp:${identifier}`);
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cache_service_1.CacheService])
], OtpService);
//# sourceMappingURL=otp.service.js.map