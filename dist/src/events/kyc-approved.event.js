"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycApprovedEvent = void 0;
class KycApprovedEvent {
    userId;
    applicantId;
    userData;
    constructor(userId, applicantId, userData) {
        this.userId = userId;
        this.applicantId = applicantId;
        this.userData = userData;
    }
}
exports.KycApprovedEvent = KycApprovedEvent;
//# sourceMappingURL=kyc-approved.event.js.map