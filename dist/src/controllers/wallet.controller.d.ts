import { WalletService } from '../services/wallet.service';
import { FireblocksService } from 'src/services/fireblocks.service';
import { TransactionService } from 'src/services/transaction.service';
import { GetTransactionsDto } from 'src/dto/get-all-transactions.dto';
export declare class WalletController {
    private readonly walletService;
    private readonly fireblocksService;
    private readonly transactionService;
    private readonly logger;
    constructor(walletService: WalletService, fireblocksService: FireblocksService, transactionService: TransactionService);
    getUserWallet(req: any): Promise<{
        status: string;
        data: import("../entities/user-wallet.entity").UserWallet;
    }>;
    getWalletBalance(req: any): Promise<{
        status: string;
        data: {
            balance: {
                hbar: number;
                usd: number;
                ngn: number;
            };
        };
    }>;
    getWalletTransactions(req: any, query: GetTransactionsDto): Promise<{
        status: string;
        data: {
            currentPage: number;
            pageSize: number;
            totalCount: number;
            totalPages: number;
            transactions: Record<string, any>;
        };
    }>;
    getTokenBalance(req: any): Promise<{
        status: string;
        data: {
            balance: number | import("long");
        };
    }>;
}
