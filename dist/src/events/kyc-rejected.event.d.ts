export declare class KycRejectedEvent {
    readonly userId: string;
    readonly applicantId: string;
    readonly rejectionReason: string;
    readonly rejectLabels: string[];
    readonly reviewRejectType: 'FINAL' | 'RETRY';
    constructor(userId: string, applicantId: string, rejectionReason: string, rejectLabels: string[], reviewRejectType: 'FINAL' | 'RETRY');
}
