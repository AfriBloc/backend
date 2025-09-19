import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Transaction } from '../entities/transaction.entity';
import { WalletService } from './wallet.service';
import { WalletType } from 'src/entities/user-wallet.entity';
export declare class TransactionService {
    private readonly transactionRepository;
    private readonly walletService;
    private readonly eventEmitter;
    private readonly logger;
    constructor(transactionRepository: Repository<Transaction>, walletService: WalletService, eventEmitter: EventEmitter2);
    getUserTransactions(userId: string, limit?: number, offset?: number, walletType?: WalletType): Promise<{
        currentPage: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        transactions: Record<string, any>;
    }>;
    getTransactionByIdAndUserId(transactionId: string, userId: string): Promise<Transaction | null>;
}
