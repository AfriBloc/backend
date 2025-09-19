import { Repository } from 'typeorm';
import { KycService } from '../services/kyc.service';
import { SumsubApiService } from '../services/sumsub-api.service';
import { KycWebhookDto } from '../dto/kyc-webhook.dto';
import { User } from '../entities/user.entity';
export declare class KycController {
    private readonly kycService;
    private readonly sumsubApiService;
    private readonly userRepository;
    private readonly logger;
    constructor(kycService: KycService, sumsubApiService: SumsubApiService, userRepository: Repository<User>);
    handleWebhook(webhookData: KycWebhookDto, signature?: string, timestamp?: string): Promise<{
        status: string;
        message: string;
    }>;
    getKycStatus(req: any): Promise<{
        status: string;
        data: {
            status: import("../enums/kyc-status.enum").KycStatus;
            applicantId?: string;
            completedAt?: Date;
            rejectionReason?: string;
        };
    }>;
    generateAccessToken(req: any): Promise<{
        status: string;
        data: {
            token: string;
            userId: string;
        };
    }>;
    healthCheck(): {
        status: string;
        message: string;
        timestamp: string;
    };
}
