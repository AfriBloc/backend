export declare class TransactionReceivedEvent {
    readonly userId: string;
    readonly transactionId: string;
    readonly amount: string;
    readonly walletType: string;
    constructor(userId: string, transactionId: string, amount: string, walletType: string);
}
