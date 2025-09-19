"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionReceivedEvent = void 0;
class TransactionReceivedEvent {
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
exports.TransactionReceivedEvent = TransactionReceivedEvent;
//# sourceMappingURL=transaction-received.event.js.map