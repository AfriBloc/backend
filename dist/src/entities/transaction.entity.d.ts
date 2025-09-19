import { User } from './user.entity';
import { Currency, NetworkType, WalletType } from './user-wallet.entity';
export declare enum TransactionType {
    DEBIT = "debit",
    CREDIT = "credit"
}
export declare enum TransactionStatus {
    PENDING = "pending",
    SUCCESS = "success",
    FAILED = "failed"
}
export declare class Transaction {
    id: string;
    userId: string;
    walletType: WalletType;
    transactionType: TransactionType;
    status: TransactionStatus;
    amount: string;
    fees: string;
    currency: Currency;
    reference: string;
    fireblockTransactionId: string | null;
    description: string | null;
    hash: string | null;
    address: string | null;
    network: NetworkType;
    spotPrice: number | null;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
