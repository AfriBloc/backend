export declare class KycWebhookDto {
    applicantId: string;
    inspectionId: string;
    correlationId?: string;
    levelName: string;
    externalUserId?: string;
    type: string;
    sandboxMode?: boolean;
    reviewStatus?: string;
    createdAtMs?: string;
    clientId?: string;
    reviewResult?: {
        reviewAnswer?: 'GREEN' | 'RED';
        rejectLabels?: string[];
        reviewRejectType?: 'FINAL' | 'RETRY';
        clientComment?: string;
        moderationComment?: string;
        buttonIds?: string[];
    };
}
