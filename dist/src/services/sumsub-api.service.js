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
var SumsubApiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SumsubApiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const crypto_1 = require("crypto");
const rxjs_1 = require("rxjs");
let SumsubApiService = SumsubApiService_1 = class SumsubApiService {
    configService;
    httpService;
    logger = new common_1.Logger(SumsubApiService_1.name);
    baseUrl;
    appToken;
    secretKey;
    constructor(configService, httpService) {
        this.configService = configService;
        this.httpService = httpService;
        this.baseUrl =
            this.configService.get('SUMSUB_BASE_URL') ||
                'https://api.sumsub.com';
        this.appToken = this.configService.get('SUMSUB_APP_TOKEN') || '';
        this.secretKey = this.configService.get('SUMSUB_SECRET_KEY') || '';
        if (!this.appToken || !this.secretKey) {
            this.logger.error('Sumsub credentials not configured');
        }
    }
    generateSignature(timestamp, method, uri, body) {
        const dataToSign = timestamp + method.toUpperCase() + uri + (body || '');
        return (0, crypto_1.createHmac)('sha256', this.secretKey)
            .update(dataToSign)
            .digest('hex');
    }
    getAuthHeaders(method, uri, body) {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const signature = this.generateSignature(timestamp, method, uri, body);
        return {
            'X-App-Token': this.appToken,
            'X-App-Access-Ts': timestamp,
            'X-App-Access-Sig': signature,
            'Content-Type': 'application/json',
        };
    }
    verifyWebhookSignature(body, signature, timestamp) {
        try {
            const expectedSignature = (0, crypto_1.createHmac)('sha256', this.secretKey)
                .update(timestamp + body)
                .digest('hex');
            return signature.toLowerCase() === expectedSignature.toLowerCase();
        }
        catch (error) {
            this.logger.error('Error verifying webhook signature:', error);
            return false;
        }
    }
    async getApplicantData(applicantId) {
        try {
            const uri = `/resources/applicants/${applicantId}/one`;
            const headers = this.getAuthHeaders('GET', uri);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}${uri}`, { headers }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error fetching applicant data for ${applicantId}:`, error);
            throw error;
        }
    }
    async createApplicant(externalUserId, levelName) {
        try {
            const uri = '/resources/applicants';
            const body = JSON.stringify({
                externalUserId,
                levelName,
                type: 'individual',
            });
            const headers = this.getAuthHeaders('POST', uri, body);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}${uri}`, JSON.parse(body), {
                headers,
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error creating applicant for user ${externalUserId}:`, error);
            throw error;
        }
    }
    async generateAccessToken(userId, levelName, ttlInSecs = 600) {
        try {
            const uri = `/resources/accessTokens?userId=${userId}&levelName=${levelName}&ttlInSecs=${ttlInSecs}`;
            const headers = this.getAuthHeaders('POST', uri);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}${uri}`, {}, { headers }));
            return response.data.token;
        }
        catch (error) {
            this.logger.error(`Error generating access token for user ${userId}:`, error);
            throw error;
        }
    }
    async generateSdkAccessToken(userId, email, levelName = 'id-and-liveness', ttlInSecs = 600) {
        try {
            const uri = '/resources/accessTokens/sdk';
            const body = JSON.stringify({
                applicantIdentifiers: {
                    email,
                },
                ttlInSecs,
                userId,
                levelName,
            });
            const headers = this.getAuthHeaders('POST', uri, body);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}${uri}`, JSON.parse(body), {
                headers,
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error generating SDK access token for user ${userId}:`, error);
            throw error;
        }
    }
};
exports.SumsubApiService = SumsubApiService;
exports.SumsubApiService = SumsubApiService = SumsubApiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        axios_1.HttpService])
], SumsubApiService);
//# sourceMappingURL=sumsub-api.service.js.map