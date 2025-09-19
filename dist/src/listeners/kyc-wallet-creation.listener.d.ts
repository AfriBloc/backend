import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { KycApprovedEvent } from '../events/kyc-approved.event';
import { User } from '../entities/user.entity';
import { WalletService } from 'src/services/wallet.service';
import { MailService } from 'src/services/mail.service';
export declare class KycWalletCreationListener {
    private readonly eventEmitter;
    private readonly userRepository;
    private readonly walletService;
    private readonly mailService;
    private readonly logger;
    constructor(eventEmitter: EventEmitter2, userRepository: Repository<User>, walletService: WalletService, mailService: MailService);
    handleKycApprovedCreateHederaWallet(event: KycApprovedEvent): Promise<void>;
}
