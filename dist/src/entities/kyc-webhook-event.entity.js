"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycWebhookEvent = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let KycWebhookEvent = class KycWebhookEvent {
    id;
    eventId;
    eventType;
    applicantId;
    externalUserId;
    payload;
    processed;
    processedAt;
    errorMessage;
    retryCount;
    user;
    createdAt;
};
exports.KycWebhookEvent = KycWebhookEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], KycWebhookEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'event_id', unique: true, type: 'varchar' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], KycWebhookEvent.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'event_type', type: 'varchar' }),
    __metadata("design:type", String)
], KycWebhookEvent.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'applicant_id', type: 'varchar' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], KycWebhookEvent.prototype, "applicantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'external_user_id', nullable: true, type: 'varchar' }),
    __metadata("design:type", Object)
], KycWebhookEvent.prototype, "externalUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payload', type: 'json' }),
    __metadata("design:type", Object)
], KycWebhookEvent.prototype, "payload", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processed', default: false }),
    __metadata("design:type", Boolean)
], KycWebhookEvent.prototype, "processed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processed_at', nullable: true, type: 'timestamp' }),
    __metadata("design:type", Object)
], KycWebhookEvent.prototype, "processedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', nullable: true, type: 'text' }),
    __metadata("design:type", Object)
], KycWebhookEvent.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'retry_count', default: 0 }),
    __metadata("design:type", Number)
], KycWebhookEvent.prototype, "retryCount", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'external_user_id' }),
    __metadata("design:type", Object)
], KycWebhookEvent.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], KycWebhookEvent.prototype, "createdAt", void 0);
exports.KycWebhookEvent = KycWebhookEvent = __decorate([
    (0, typeorm_1.Entity)('kyc_webhook_events')
], KycWebhookEvent);
//# sourceMappingURL=kyc-webhook-event.entity.js.map