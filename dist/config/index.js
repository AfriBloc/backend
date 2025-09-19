"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = exports.config = exports.dataSource = void 0;
exports.default = configuration;
const process = require("process");
function configuration() {
    return {
        port: parseInt(process.env.PORT ?? '3000', 10),
        env: process.env.APP_ENV,
        url: process.env.APP_URL,
        name: process.env.APP_NAME,
        admin: process.env.ADMIN_EMAIL,
        client: { url: process.env.CLIENT_URL },
        auth: {
            secret: process.env.APP_SECRET,
        },
        redis: {
            host: process.env.REDIS_HOST ?? '',
            port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
            password: process.env.REDIS_PASSWORD,
            ...(process.env.REDIS_DB ? { db: process.env.REDIS_DB } : {}),
            prefix: process.env.REDIS_PREFIX ?? 'afribloc',
        },
        resend: {
            apiKey: process.env.RESEND_API_KEY,
        },
        mail: {
            from: process.env.MAIL_FROM,
            from_name: process.env.MAIL_FROM_NAME,
        },
        imagekit: {
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
            folderImages: process.env.IMAGEKIT_FOLDER_IMAGES || '/properties/images',
            folderDocuments: process.env.IMAGEKIT_FOLDER_DOCUMENTS || '/properties/documents',
        },
        fireblocks: {
            apiKey: process.env.FIREBLOCKS_API_KEY,
            adminKey: process.env.FIREBLOCKS_ADMIN_KEY,
            adminId: process.env.FIREBLOCKS_ADMIN_ID,
        },
        coingecko: {
            apiKey: process.env.COIN_GECKO_API_KEY,
        },
    };
}
__exportStar(require("./database.config"), exports);
var data_source_1 = require("../database/data-source");
Object.defineProperty(exports, "dataSource", { enumerable: true, get: function () { return data_source_1.dataSource; } });
var data_source_2 = require("../database/data-source");
Object.defineProperty(exports, "config", { enumerable: true, get: function () { return data_source_2.config; } });
var data_source_3 = require("../database/data-source");
Object.defineProperty(exports, "env", { enumerable: true, get: function () { return data_source_3.env; } });
//# sourceMappingURL=index.js.map