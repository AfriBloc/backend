"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionFailedEvent = void 0;
class TransactionFailedEvent {
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
exports.TransactionFailedEvent = TransactionFailedEvent;
//# sourceMappingURL=transaction-failed.event.js.map