"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycRejectedEvent = void 0;
class KycRejectedEvent {
    userId;
    applicantId;
    rejectionReason;
    rejectLabels;
    reviewRejectType;
    constructor(userId, applicantId, rejectionReason, rejectLabels, reviewRejectType) {
        this.userId = userId;
        this.applicantId = applicantId;
        this.rejectionReason = rejectionReason;
        this.rejectLabels = rejectLabels;
        this.reviewRejectType = reviewRejectType;
    }
}
exports.KycRejectedEvent = KycRejectedEvent;
//# sourceMappingURL=kyc-rejected.event.js.map