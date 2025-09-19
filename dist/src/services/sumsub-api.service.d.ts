import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
export declare class SumsubApiService {
    private readonly configService;
    private readonly httpService;
    private readonly logger;
    private readonly baseUrl;
    private readonly appToken;
    private readonly secretKey;
    constructor(configService: ConfigService, httpService: HttpService);
    private generateSignature;
    private getAuthHeaders;
    verifyWebhookSignature(body: string, signature: string, timestamp: string): boolean;
    getApplicantData(applicantId: string): Promise<any>;
    createApplicant(externalUserId: string, levelName: string): Promise<any>;
    generateAccessToken(userId: string, levelName: string, ttlInSecs?: number): Promise<string>;
    generateSdkAccessToken(userId: string, email: string, levelName?: string, ttlInSecs?: number): Promise<{
        token: string;
        userId: string;
    }>;
}
