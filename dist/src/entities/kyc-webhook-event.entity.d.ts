import { User } from './user.entity';
export declare class KycWebhookEvent {
    id: string;
    eventId: string;
    eventType: string;
    applicantId: string;
    externalUserId: string | null;
    payload: any;
    processed: boolean;
    processedAt: Date | null;
    errorMessage: string | null;
    retryCount: number;
    user: User | null;
    createdAt: Date;
}
