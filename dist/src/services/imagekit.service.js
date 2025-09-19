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
var ImageKitService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageKitService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ImageKit = require("imagekit");
let ImageKitService = ImageKitService_1 = class ImageKitService {
    config;
    client;
    logger = new common_1.Logger(ImageKitService_1.name);
    publicKey;
    privateKey;
    urlEndpoint;
    constructor(config) {
        this.config = config;
        this.publicKey = this.config.get('imagekit.publicKey') || '';
        this.privateKey = this.config.get('imagekit.privateKey') || '';
        this.urlEndpoint = this.config.get('imagekit.urlEndpoint') || '';
        if (!this.publicKey || !this.privateKey || !this.urlEndpoint) {
            this.logger.warn('ImageKit configuration is incomplete. Please check publicKey, privateKey, and urlEndpoint.');
        }
        this.client = new ImageKit({
            publicKey: this.publicKey,
            privateKey: this.privateKey,
            urlEndpoint: this.urlEndpoint,
        });
    }
    async upload(fileBuffer, fileName, folder) {
        const res = await this.client.upload({
            file: fileBuffer,
            fileName,
            folder,
            useUniqueFileName: true,
            overwriteFile: false,
        });
        return { url: res.url, fileId: res.fileId, name: res.name };
    }
};
exports.ImageKitService = ImageKitService;
exports.ImageKitService = ImageKitService = ImageKitService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ImageKitService);
//# sourceMappingURL=imagekit.service.js.map