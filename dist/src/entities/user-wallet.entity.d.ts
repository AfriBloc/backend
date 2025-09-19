import { User } from './user.entity';
export declare enum WalletType {
    HEDERA = "HEDERA"
}
export declare enum Currency {
    HBAR = "HBAR",
    USD = "USD",
    NGN = "NGN"
}
export declare enum NetworkType {
    MAINNET = "mainnet",
    TESTNET = "testnet"
}
export declare class UserWallet {
    id: string;
    walletAddress: string;
    evmAddress: string;
    isActive: boolean;
    walletType: WalletType;
    networkType: NetworkType;
    asset: string;
    currency: Currency;
    vaultId: string;
    balance: number;
    userId: string;
    user: User;
    createdAt: Date;
    updatedAt: Date;
}
