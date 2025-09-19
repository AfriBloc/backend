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
exports.KycApplicant = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const kyc_status_enum_1 = require("../enums/kyc-status.enum");
let KycApplicant = class KycApplicant {
    id;
    userId;
    applicantId;
    inspectionId;
    externalUserId;
    levelName;
    reviewStatus;
    reviewAnswer;
    rejectLabels;
    reviewRejectType;
    clientComment;
    moderationComment;
    rawData;
    createdAt;
    updatedAt;
    user;
};
exports.KycApplicant = KycApplicant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], KycApplicant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'varchar' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], KycApplicant.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'applicant_id', unique: true, type: 'varchar' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], KycApplicant.prototype, "applicantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'inspection_id', type: 'varchar' }),
    __metadata("design:type", String)
], KycApplicant.prototype, "inspectionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'external_user_id', type: 'varchar' }),
    __metadata("design:type", String)
], KycApplicant.prototype, "externalUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'level_name', type: 'varchar' }),
    __metadata("design:type", String)
], KycApplicant.prototype, "levelName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'review_status', type: 'enum', enum: kyc_status_enum_1.KycStatus }),
    __metadata("design:type", String)
], KycApplicant.prototype, "reviewStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'review_answer', nullable: true, type: 'varchar' }),
    __metadata("design:type", Object)
], KycApplicant.prototype, "reviewAnswer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reject_labels', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], KycApplicant.prototype, "rejectLabels", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'review_reject_type', nullable: true, type: 'varchar' }),
    __metadata("design:type", Object)
], KycApplicant.prototype, "reviewRejectType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'client_comment', nullable: true, type: 'text' }),
    __metadata("design:type", Object)
], KycApplicant.prototype, "clientComment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'moderation_comment', nullable: true, type: 'text' }),
    __metadata("design:type", Object)
], KycApplicant.prototype, "moderationComment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'raw_data', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], KycApplicant.prototype, "rawData", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], KycApplicant.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], KycApplicant.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], KycApplicant.prototype, "user", void 0);
exports.KycApplicant = KycApplicant = __decorate([
    (0, typeorm_1.Entity)('kyc_applicants')
], KycApplicant);
//# sourceMappingURL=kyc-applicant.entity.js.map