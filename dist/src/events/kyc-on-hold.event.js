"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycOnHoldEvent = void 0;
class KycOnHoldEvent {
    userId;
    applicantId;
    reason;
    constructor(userId, applicantId, reason) {
        this.userId = userId;
        this.applicantId = applicantId;
        this.reason = reason;
    }
}
exports.KycOnHoldEvent = KycOnHoldEvent;
//# sourceMappingURL=kyc-on-hold.event.js.map