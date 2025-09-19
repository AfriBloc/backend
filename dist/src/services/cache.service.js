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
exports.TTL = exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
let CacheService = class CacheService {
    client;
    constructor(client) {
        this.client = client;
    }
    async set(key, value, ttl) {
        const serializedValue = JSON.stringify(value);
        if (ttl) {
            await this.client.set(key, serializedValue, 'EX', ttl);
        }
        else {
            await this.client.set(key, serializedValue);
        }
    }
    async get(key) {
        const value = await this.client.get(key);
        if (!value) {
            return null;
        }
        return JSON.parse(value);
    }
    async del(key) {
        await this.client.del(key);
    }
    async remember(key, ttl, cb) {
        let value = await this.get(key);
        if (value) {
            return value;
        }
        value = await cb();
        await this.set(key, value, ttl);
        return value;
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [ioredis_1.default])
], CacheService);
var TTL;
(function (TTL) {
    TTL[TTL["FIVE_MINUTES"] = 300] = "FIVE_MINUTES";
    TTL[TTL["TEN_MINUTES"] = 600] = "TEN_MINUTES";
    TTL[TTL["ONE_HOUR"] = 3600] = "ONE_HOUR";
    TTL[TTL["ONE_DAY"] = 86400] = "ONE_DAY";
    TTL[TTL["THREE_DAYS"] = 259200] = "THREE_DAYS";
    TTL[TTL["ONE_WEEK"] = 604800] = "ONE_WEEK";
    TTL[TTL["ONE_MONTH"] = 2592000] = "ONE_MONTH";
    TTL[TTL["ONE_YEAR"] = 31536000] = "ONE_YEAR";
})(TTL || (exports.TTL = TTL = {}));
//# sourceMappingURL=cache.service.js.map