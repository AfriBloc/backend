import { ConfigService } from '@nestjs/config';
import { VaultAccount, FireblocksResponse } from '@fireblocks/ts-sdk';
import { User } from 'src/entities/user.entity';
import { Property } from 'src/entities/property.entity';
import { UserWallet } from 'src/entities/user-wallet.entity';
import { Transaction } from 'src/entities/transaction.entity';
export declare class FireblocksService {
    private readonly configService;
    private readonly config;
    private readonly fireblocks;
    constructor(configService: ConfigService);
    createVaultAccount(userId: string, email: string): Promise<FireblocksResponse<VaultAccount>>;
    activateAsset(vault: FireblocksResponse<VaultAccount>): Promise<FireblocksResponse<import("@fireblocks/ts-sdk").CreateVaultAssetResponse> | undefined>;
    createHederaWallet(user: User): Promise<{
        vaultId: string;
        address: string;
        evmAddress: string;
        asset: string;
    }>;
    getWalletBalance(wallet: UserWallet): Promise<string | undefined>;
    generateSymbol(property: Property): string;
    createFungibleKycToken(property: Property): Promise<{
        tokenId: string;
        symbol: string;
    }>;
    associateTokenWithVault(vaultId: string, vaultAccountId: string, tokenId: string): Promise<{
        success: boolean;
        status: string;
        accountId: string;
        tokenId: string;
    }>;
    grantKyc(accountId: string, tokenId: string): Promise<{
        success: boolean;
        status: string;
    }>;
    transferFungibleToken(tokenId: string, to: string, toVaultId: string, amount: number, transaction: Transaction, numOfUnits: number, decimals?: number): Promise<{
        success: boolean;
        transactionId: string;
        transactionHash: string;
        status: string;
    }>;
    getTokenBalance(accountId: string, tokenId: string): Promise<import("@hashgraph/sdk").Long | 0>;
    grantAndTransfer(accountId: string, toVaultId: string, tokenId: string, amount: number, transaction: Transaction, numOfUnits: number): Promise<{
        success: boolean;
        transactionId: string;
        transactionHash: string;
        status: string;
    }>;
}
