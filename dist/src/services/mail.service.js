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
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ejs = require("ejs");
const path = require("path");
const path_helper_1 = require("../helpers/path.helper");
const resend_1 = require("resend");
const dotenv = require("dotenv");
dotenv.config();
let MailService = MailService_1 = class MailService {
    config;
    resendClient;
    logger = new common_1.Logger(MailService_1.name);
    constructor(config) {
        this.config = config;
        this.resendClient = new resend_1.Resend(process.env.RESEND_API_KEY);
    }
    async sendTemplate(template, data, options) {
        const templatePath = (0, path_helper_1.getResourcesDir)(path.join('templates/email', `${template}_en-us.ejs`));
        const html = await ejs.renderFile(templatePath, data, options?.template);
        return this.resendClient.emails.send({
            to: options.mail.recipient.email,
            from: this.config.get('mail.from', { infer: true }) ??
                'no-reply@afribloc.local',
            subject: options.mail.subject,
            html,
        });
    }
    sendUserOtp(email, otp) {
        const data = {
            email,
            otp: String(otp).split(''),
        };
        this.sendTemplate('user_setup', data, {
            mail: {
                recipient: { email: data.email },
                tags: ['user_setup'],
                subject: 'Your One-Time Password (OTP)',
            },
        })
            .then((r) => {
            this.logger.log({ response: r });
        })
            .catch((error) => {
            this.logger.error('Failed to send email', error);
        });
    }
    sendUserWelcome(user) {
        const data = {
            firstName: user.firstName,
            email: user.email,
        };
        this.sendTemplate('user_welcome', data, {
            mail: {
                recipient: { email: data.email },
                tags: ['user_welcome'],
                subject: 'Welcome to AfriBloc!',
            },
        })
            .then((r) => {
            this.logger.log({ response: r });
        })
            .catch((error) => {
            this.logger.error('Failed to send email', error);
        });
    }
    sendPropertyPurchasedEmail(transaction, property, user, totalPrice, numUnits) {
        const data = {
            firstName: user.firstName,
            email: user.email,
            property,
            transaction,
            totalPrice,
            numUnits,
        };
        this.sendTemplate('property_purchased', data, {
            mail: {
                recipient: { email: data.email },
                tags: ['property_purchased'],
                subject: 'You have successfully purchased a property',
            },
        })
            .then((r) => {
            this.logger.log({ response: r });
        })
            .catch((error) => {
            this.logger.error('Failed to send email', error);
        });
    }
    sendWalletCreatedEmail(wallet, user) {
        const data = {
            firstName: user.firstName,
            email: user.email,
            wallet,
        };
        this.sendTemplate('wallet_created', data, {
            mail: {
                recipient: { email: data.email },
                tags: ['wallet_created'],
                subject: 'Your wallet has been created',
            },
        })
            .then((r) => {
            this.logger.log({ response: r });
        })
            .catch((error) => {
            this.logger.error('Failed to send email', error);
        });
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map