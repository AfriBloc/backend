"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionSuccessEvent = void 0;
class TransactionSuccessEvent {
    userId;
    transactionId;
    amount;
    walletType;
    constructor(userId, transactionId, amount, walletType) {
        this.userId = userId;
        this.transactionId = transactionId;
        this.amount = amount;
        this.walletType = walletType;
    }
}
exports.TransactionSuccessEvent = TransactionSuccessEvent;
//# sourceMappingURL=transaction-success.event.js.map