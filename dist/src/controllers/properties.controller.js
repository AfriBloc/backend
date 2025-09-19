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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertiesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const properties_service_1 = require("../services/properties.service");
const config_1 = require("@nestjs/config");
const imagekit_service_1 = require("../services/imagekit.service");
const storage_service_1 = require("../services/storage.service");
const create_property_dto_1 = require("../dto/create-property.dto");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const purchase_property_dto_1 = require("../dto/purchase-property.dto");
function hasUrl(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'url' in obj &&
        typeof obj.url === 'string');
}
let PropertiesController = class PropertiesController {
    propertiesService;
    imageKit;
    storage;
    config;
    constructor(propertiesService, imageKit, storage, config) {
        this.propertiesService = propertiesService;
        this.imageKit = imageKit;
        this.storage = storage;
        this.config = config;
    }
    async list() {
        return { data: await this.propertiesService.list() };
    }
    async get(id) {
        return { data: await this.propertiesService.getById(id) };
    }
    async createProperty(createPropertyDto, files) {
        const imageUrls = [];
        if (Array.isArray(files.images)) {
            for (const file of files.images) {
                if (file &&
                    typeof file === 'object' &&
                    Buffer.isBuffer(file.buffer) &&
                    typeof file.originalname === 'string' &&
                    typeof file.mimetype === 'string') {
                    let upload;
                    try {
                        upload = await this.storage.uploadImage(file, 'imagekit.folderImages');
                    }
                    catch {
                        throw new common_1.BadRequestException('Image upload failed.');
                    }
                    if (!hasUrl(upload)) {
                        throw new common_1.BadRequestException('Image upload failed.');
                    }
                    const { url } = upload;
                    imageUrls.push(url);
                }
            }
        }
        const docUrls = {};
        if (Array.isArray(files.governorsConsent) && files.governorsConsent[0]) {
            const file = files.governorsConsent[0];
            if (file &&
                typeof file === 'object' &&
                Buffer.isBuffer(file.buffer) &&
                typeof file.originalname === 'string' &&
                typeof file.mimetype === 'string') {
                let upload;
                try {
                    upload = await this.storage.uploadImage(file, 'imagekit.folderDocuments');
                }
                catch {
                    throw new common_1.BadRequestException('Governors Consent document upload failed.');
                }
                if (!hasUrl(upload)) {
                    throw new common_1.BadRequestException('Governors Consent document upload failed.');
                }
                docUrls.governorsConsentUrl = upload.url;
            }
        }
        if (Array.isArray(files.deedOfAssignment) && files.deedOfAssignment[0]) {
            const file = files.deedOfAssignment[0];
            if (file &&
                typeof file === 'object' &&
                Buffer.isBuffer(file.buffer) &&
                typeof file.originalname === 'string' &&
                typeof file.mimetype === 'string') {
                let upload;
                try {
                    upload = await this.storage.uploadImage(file, 'imagekit.folderDocuments');
                }
                catch {
                    throw new common_1.BadRequestException('Deed of Assignment document upload failed.');
                }
                if (!hasUrl(upload)) {
                    throw new common_1.BadRequestException('Deed of Assignment document upload failed.');
                }
                docUrls.deedOfAssignmentUrl = upload.url;
            }
        }
        if (Array.isArray(files.surveyPlan) && files.surveyPlan[0]) {
            const file = files.surveyPlan[0];
            if (file &&
                typeof file === 'object' &&
                Buffer.isBuffer(file.buffer) &&
                typeof file.originalname === 'string' &&
                typeof file.mimetype === 'string') {
                let upload;
                try {
                    upload = await this.storage.uploadImage(file, 'imagekit.folderDocuments');
                }
                catch {
                    throw new common_1.BadRequestException('Survey Plan document upload failed.');
                }
                if (!hasUrl(upload)) {
                    throw new common_1.BadRequestException('Survey Plan document upload failed.');
                }
                docUrls.surveyPlanUrl = upload.url;
            }
        }
        const property = await this.propertiesService.createFull({
            ...createPropertyDto,
            imageUrls,
            governorsConsentUrl: docUrls.governorsConsentUrl ?? null,
            deedOfAssignmentUrl: docUrls.deedOfAssignmentUrl ?? null,
            surveyPlanUrl: docUrls.surveyPlanUrl ?? null,
        });
        return property;
    }
    async seedProperty(body) {
        const results = [];
        for (const property of body.properties) {
            const { ...propertyDtoRaw } = property;
            const propertyDto = propertyDtoRaw;
            const created = await this.propertiesService.createFull(propertyDto);
            results.push(created);
        }
        return results;
    }
    async purchasePropertyUnits(dto, req) {
        const user = req.user;
        const result = await this.propertiesService.purchasePropertyUnits(user, dto.propertyId, dto.units);
        return result;
    }
};
exports.PropertiesController = PropertiesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'deedOfAssignment', maxCount: 1 },
        { name: 'governorsConsent', maxCount: 1 },
        { name: 'surveyPlan', maxCount: 1 },
        { name: 'images', maxCount: 20 },
    ])),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_property_dto_1.CreatePropertyDto, Object]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "createProperty", null);
__decorate([
    (0, common_1.Post)('seed'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_property_dto_1.SeedPropertiesDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "seedProperty", null);
__decorate([
    (0, common_1.Post)('purchase'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [purchase_property_dto_1.PurchasePropertyDto, Object]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "purchasePropertyUnits", null);
exports.PropertiesController = PropertiesController = __decorate([
    (0, common_1.Controller)('properties'),
    __metadata("design:paramtypes", [properties_service_1.PropertiesService,
        imagekit_service_1.ImageKitService,
        storage_service_1.StorageService,
        config_1.ConfigService])
], PropertiesController);
//# sourceMappingURL=properties.controller.js.map