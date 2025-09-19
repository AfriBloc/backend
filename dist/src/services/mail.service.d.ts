import { ConfigService } from '@nestjs/config';
import { User } from 'src/entities/user.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { Property } from 'src/entities/property.entity';
import { UserWallet } from 'src/entities/user-wallet.entity';
interface ConfigServiceShape {
    resend: {
        apiKey: string;
    };
    mail: {
        from: string;
        from_name: string;
    };
}
export declare class MailService {
    private readonly config;
    private readonly resendClient;
    private readonly logger;
    constructor(config: ConfigService<ConfigServiceShape>);
    sendTemplate<T>(template: string, data: T, options: {
        template?: Record<string, any>;
        mail: {
            tags?: string[];
            attachments?: {
                type: string;
                name: string;
                content: string;
            }[];
            recipient: {
                email: string;
                name?: string;
            };
            subject: string;
        };
    }): Promise<import("resend").CreateEmailResponse>;
    sendUserOtp(email: string, otp: string): void;
    sendUserWelcome(user: User): void;
    sendPropertyPurchasedEmail(transaction: Transaction, property: Property, user: User, totalPrice: number, numUnits: number): void;
    sendWalletCreatedEmail(wallet: UserWallet, user: User): void;
}
export {};
