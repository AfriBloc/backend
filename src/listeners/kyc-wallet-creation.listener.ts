import { Injectable, Logger } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KycApprovedEvent } from '../events/kyc-approved.event';
import { User } from '../entities/user.entity';
import { WalletService } from 'src/services/wallet.service';
import { WalletType } from 'src/entities/user-wallet.entity';

@Injectable()
export class KycWalletCreationListener {
  private readonly logger = new Logger(KycWalletCreationListener.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly walletService: WalletService,
  ) {}

  @OnEvent('kyc.approved')
  async handleKycApprovedCreateHederaWallet(
    event: KycApprovedEvent,
  ): Promise<void> {
    this.logger.log(`Creating wallet for approved KYC user: ${event.userId}`);

    try {
      // Get full user object for wallet generation
      const user = await this.userRepository.findOne({
        where: { id: event.userId },
      });

      if (!user) {
        this.logger.error(
          `User not found for wallet creation: ${event.userId}`,
        );
        return;
      }

      // Generate Core DAO wallet for USDT
      const hederaWallet = await this.walletService.createWallet(user);

      this.logger.log(
        `wallet created for user ${event.userId}: ${hederaWallet.walletAddress}`,
      );

      // Emit wallet created event for WebSocket notification
      this.eventEmitter.emit('wallet.created', {
        userId: event.userId,
        walletType: WalletType.HEDERA,
        address: hederaWallet.walletAddress,
        network: hederaWallet.networkType,
      });
    } catch (error) {
      this.logger.error(
        `Error creating wallet for user ${event.userId}:`,
        error,
      );
    }
  }
}
