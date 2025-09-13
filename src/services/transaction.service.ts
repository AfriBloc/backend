import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Transaction } from '../entities/transaction.entity';
import { WalletService } from './wallet.service';
import { WalletType } from 'src/entities/user-wallet.entity';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly walletService: WalletService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // /**
  //  * Find transaction by Bitnob transaction ID
  //  */
  // async findByBitnobTransactionId(bitnobTransactionId: string): Promise<Transaction | null> {
  //   return this.transactionRepository.findOne({
  //     where: { bitnobTransactionId },
  //   });
  // }

  /**
   * Update transaction status
   */
  // async updateTransactionStatus(
  //   transactionId: string,
  //   status: TransactionStatus,
  //   webhookData?: BitnobWebhookData,
  // ): Promise<Transaction> {
  //   const transaction = await this.transactionRepository.findOne({
  //     where: { id: transactionId },
  //   });

  //   if (!transaction) {
  //     throw new Error('Transaction not found');
  //   }

  //   transaction.status = status;
  //   transaction.webhookProcessedAt = new Date();

  //   if (webhookData) {
  //     transaction.hash = webhookData.hash;
  //     transaction.confirmations = webhookData.confirmations;
  //     if (webhookData.spotPrice) {
  //       transaction.spotPrice = parseFloat(webhookData.spotPrice);
  //     }
  //     if (webhookData.btcAmount) {
  //       transaction.btcAmount = parseFloat(webhookData.btcAmount);
  //     }
  //   }

  //   await this.transactionRepository.save(transaction);

  //   this.logger.log(`Updated transaction ${transactionId} status to ${status}`);
  //   return transaction;
  // }

  /**
   * Get user transaction history
   */
  async getUserTransactions(
    userId: string,
    limit: number = 20,
    offset: number = 1,
    walletType?: WalletType,
  ) {
    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId })
      .orderBy('transaction.createdAt', 'DESC')
      .take(limit)
      .skip(limit * ((offset ?? 1) - 1));

    if (walletType) {
      query.andWhere('transaction.walletType = :walletType', { walletType });
    }

    const [transactions, totalCount] = await query.getManyAndCount();

    const totalPages = Math.ceil(totalCount / limit);

    return {
      currentPage: offset,
      pageSize: limit,
      totalCount: totalCount,
      totalPages: totalPages,
      transactions: instanceToPlain<Partial<Transaction[]>>(transactions),
    };
  }

  /**
   * Get transaction by ID and user ID
   */
  async getTransactionByIdAndUserId(
    transactionId: string,
    userId: string,
  ): Promise<Transaction | null> {
    return this.transactionRepository.findOne({
      where: { id: transactionId, userId },
    });
  }
}
