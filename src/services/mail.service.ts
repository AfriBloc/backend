import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ejs from 'ejs';
import * as path from 'path';
import { getResourcesDir } from 'src/helpers/path.helper';
import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import { User } from 'src/entities/user.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { Property } from 'src/entities/property.entity';
import { UserWallet } from 'src/entities/user-wallet.entity';

dotenv.config();

interface ConfigServiceShape {
  resend: {
    apiKey: string;
  };
  mail: {
    from: string;
    from_name: string;
  };
}

@Injectable()
export class MailService {
  private readonly resendClient: Resend;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService<ConfigServiceShape>) {
    this.resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  async sendTemplate<T>(
    template: string,
    data: T,
    options: {
      template?: Record<string, any>;
      mail: {
        tags?: string[];
        attachments?: { type: string; name: string; content: string }[];
        recipient: { email: string; name?: string };
        subject: string;
      };
    },
  ) {
    const templatePath = getResourcesDir(
      path.join('templates/email', `${template}_en-us.ejs`),
    );

    const html = await ejs.renderFile(templatePath, data, options?.template);

    return this.resendClient.emails.send({
      to: options.mail.recipient.email,
      from:
        this.config.get('mail.from', { infer: true }) ??
        'no-reply@afribloc.local',
      subject: options.mail.subject,
      html,
    });
  }

  sendUserOtp(email: string, otp: string) {
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

  sendUserWelcome(user: User) {
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

  sendPropertyPurchasedEmail(
    transaction: Transaction,
    property: Property,
    user: User,
    totalPrice: number,
    numUnits: number,
  ) {
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

  sendWalletCreatedEmail(wallet: UserWallet, user: User) {
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

  // sendPasswordResetEmail(data: PasswordResetRequestEvent) {
  //   this.sendTemplate("password_reset", data, {
  //     mail: {
  //       recipient: { email: data.user.email },
  //       tags: ["password_reset"],
  //       subject: "Reset your password"
  //     }
  //   })
  //     .then((r) => {
  //       this.logger.log({ response: r });
  //     })
  //     .catch((error) => this.logger.error("Failed to send email", error));
  // }
}
