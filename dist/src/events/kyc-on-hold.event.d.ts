export declare class KycOnHoldEvent {
    readonly userId: string;
    readonly applicantId: string;
    readonly reason: string;
    constructor(userId: string, applicantId: string, reason: string);
}
