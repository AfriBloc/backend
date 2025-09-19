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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const kyc_status_enum_1 = require("../enums/kyc-status.enum");
const verification_entity_1 = require("./verification.entity");
const kyc_applicant_entity_1 = require("./kyc-applicant.entity");
const kyc_webhook_event_entity_1 = require("./kyc-webhook-event.entity");
const user_wallet_entity_1 = require("./user-wallet.entity");
let User = class User {
    id;
    firstName;
    lastName;
    email;
    phoneNumber;
    password;
    emailVerifiedAt;
    phoneVerifiedAt;
    passwordResetToken;
    passwordResetExpires;
    middleName;
    dateOfBirth;
    gender;
    nationality;
    placeOfBirth;
    kycStatus;
    kycApplicantId;
    kycCompletedAt;
    verifications;
    kycApplicants;
    kycWebhookEvents;
    wallets;
    createdAt;
    updatedAt;
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_name', nullable: true, type: 'varchar', length: 100 }),
    __metadata("design:type", Object)
], User.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_name', nullable: true, type: 'varchar', length: 100 }),
    __metadata("design:type", Object)
], User.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 255, type: 'varchar' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone_number', nullable: true, unique: true, length: 20 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], User.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email_verified_at', nullable: true, type: 'timestamp' }),
    __metadata("design:type", Object)
], User.prototype, "emailVerifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone_verified_at', nullable: true, type: 'timestamp' }),
    __metadata("design:type", Object)
], User.prototype, "phoneVerifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'password_reset_token',
        nullable: true,
        length: 255,
        type: 'varchar',
    }),
    __metadata("design:type", Object)
], User.prototype, "passwordResetToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'password_reset_expires', nullable: true, type: 'timestamp' }),
    __metadata("design:type", Object)
], User.prototype, "passwordResetExpires", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'middle_name', nullable: true, type: 'varchar', length: 100 }),
    __metadata("design:type", Object)
], User.prototype, "middleName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_of_birth', nullable: true, type: 'date' }),
    __metadata("design:type", Object)
], User.prototype, "dateOfBirth", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gender', nullable: true, type: 'varchar', length: 1 }),
    __metadata("design:type", Object)
], User.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nationality', nullable: true, type: 'varchar', length: 3 }),
    __metadata("design:type", Object)
], User.prototype, "nationality", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'place_of_birth',
        nullable: true,
        type: 'varchar',
        length: 255,
    }),
    __metadata("design:type", Object)
], User.prototype, "placeOfBirth", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'kyc_status',
        type: 'enum',
        enum: kyc_status_enum_1.KycStatus,
        default: kyc_status_enum_1.KycStatus.PENDING,
    }),
    __metadata("design:type", String)
], User.prototype, "kycStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'kyc_applicant_id', nullable: true, type: 'varchar' }),
    __metadata("design:type", Object)
], User.prototype, "kycApplicantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'kyc_completed_at', nullable: true, type: 'timestamp' }),
    __metadata("design:type", Object)
], User.prototype, "kycCompletedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => verification_entity_1.Verification, (verification) => verification.user),
    __metadata("design:type", Array)
], User.prototype, "verifications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => kyc_applicant_entity_1.KycApplicant, (kycApplicant) => kycApplicant.user),
    __metadata("design:type", Array)
], User.prototype, "kycApplicants", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => kyc_webhook_event_entity_1.KycWebhookEvent, (event) => event.user),
    __metadata("design:type", Array)
], User.prototype, "kycWebhookEvents", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_wallet_entity_1.UserWallet, (wallet) => wallet.user),
    __metadata("design:type", Array)
], User.prototype, "wallets", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map