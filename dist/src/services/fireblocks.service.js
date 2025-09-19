"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FireblocksService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const hedera_custodians_integration_1 = require("@hashgraph/hedera-custodians-integration");
const ts_sdk_1 = require("@fireblocks/ts-sdk");
const sdk_1 = require("@hashgraph/sdk");
const path_helper_1 = require("../helpers/path.helper");
const fs_1 = require("fs");
let FireblocksService = class FireblocksService {
    configService;
    config;
    fireblocks;
    constructor(configService) {
        this.configService = configService;
        this.config = {
            apiKey: this.configService.get('fireblocks.apiKey') || '',
            apiSecretKey: (0, fs_1.readFileSync)((0, path_helper_1.getSecretsDir)('fireblocks_secret.key'), 'utf8'),
            baseUrl: ts_sdk_1.BasePath.Sandbox,
            adminKey: this.configService.get('fireblocks.adminKey') || '',
            adminId: this.configService.get('fireblocks.adminId') || '',
        };
        this.fireblocks = new ts_sdk_1.Fireblocks({
            apiKey: this.config.apiKey,
            basePath: ts_sdk_1.BasePath.Sandbox,
            secretKey: this.config.apiSecretKey,
        });
    }
    async createVaultAccount(userId, email) {
        try {
            const vault = await this.fireblocks.vaults.createVaultAccount({
                createVaultAccountRequest: {
                    name: email,
                    customerRefId: userId,
                    hiddenOnUI: false,
                    autoFuel: false,
                },
            });
            return vault;
        }
        catch (e) {
            console.log(e);
            throw new Error(`Fireblocks API error: ${e.response?.data || e.message}`);
        }
    }
    async activateAsset(vault) {
        const idemKey = Math.random();
        if (!vault?.data?.id) {
            throw new common_1.InternalServerErrorException('Invalid vault account ID');
        }
        try {
            const wallet = await this.fireblocks.vaults.activateAssetForVaultAccount({
                vaultAccountId: vault?.data?.id,
                assetId: 'HBAR_TEST',
                idempotencyKey: idemKey.toString(),
            });
            return wallet;
        }
        catch (e) {
            console.log(e);
        }
    }
    async createHederaWallet(user) {
        try {
            const vault = await this.createVaultAccount(user.id, user.email);
            const wallet = await this.activateAsset(vault);
            const hcsAddress = wallet?.data?.address;
            if (!hcsAddress) {
                console.log('Failed to retrieve HCS address');
                throw new common_1.InternalServerErrorException('Failed to retrieve HCS address');
            }
            const evmAddress = sdk_1.AccountId.fromString(hcsAddress).toEvmAddress();
            const config = new hedera_custodians_integration_1.FireblocksConfig(process.env.FIREBLOCKS_API_KEY, this.config.apiSecretKey, ts_sdk_1.BasePath.Sandbox, vault.data.id, 'HBAR_TEST');
            new hedera_custodians_integration_1.CustodialWalletService(config);
            return {
                vaultId: vault.data.id,
                address: hcsAddress,
                evmAddress: evmAddress,
                asset: 'HBAR_TEST',
            };
        }
        catch (error) {
            throw new Error(`Fireblocks API error: ${error.response?.data || error.message}`);
        }
    }
    async getWalletBalance(wallet) {
        try {
            const balance = await this.fireblocks.vaults.getVaultAccount({
                vaultAccountId: wallet.vaultId,
            });
            if (!balance || !balance.data || !balance.data.assets) {
                throw new common_1.InternalServerErrorException('Failed to fetch wallet balance');
            }
            console.log(balance.data.assets);
            const hbar_balance = balance?.data?.assets.find((asset) => asset.id === 'HBAR_TEST')?.available;
            return hbar_balance;
        }
        catch (error) {
            throw new Error(`Fireblocks API error: ${error.response?.data || error.message}`);
        }
    }
    generateSymbol(property) {
        const cleanTitle = property.title.replace(/\s+/g, '').toUpperCase();
        const cleanLocation = property.location
            .replace(/[\s,]+/g, '')
            .toUpperCase();
        const titleSegment = cleanTitle.substring(0, 4);
        const locationSegment = cleanLocation.substring(0, 3);
        const idSegment = property.id
            .replace(/[^A-Z0-9]/gi, '')
            .substring(0, 4)
            .toUpperCase();
        const randomNumber = Math.floor(100 + Math.random() * 900);
        return `${titleSegment}${locationSegment}${idSegment}${randomNumber}`;
    }
    async createFungibleKycToken(property) {
        const operatorKey = sdk_1.PrivateKey.fromStringECDSA(this.config.adminKey);
        const operatorId = sdk_1.AccountId.fromString(this.config.adminId);
        const client = sdk_1.Client.forTestnet().setOperator(operatorId, operatorKey);
        const kycKey = sdk_1.PrivateKey.fromStringECDSA(this.config.adminKey);
        const freezeKey = sdk_1.PrivateKey.fromStringECDSA(this.config.adminKey);
        const adminKey = sdk_1.PrivateKey.fromStringECDSA(this.config.adminKey);
        const symbol = this.generateSymbol(property);
        const tx = new sdk_1.TokenCreateTransaction()
            .setTokenName(`${property.title}`)
            .setTokenSymbol(symbol)
            .setDecimals(8)
            .setInitialSupply(property.numUnits * 1e8)
            .setMaxSupply(property.numUnits * 1e8)
            .setTreasuryAccountId(operatorId)
            .setTokenType(sdk_1.TokenType.FungibleCommon)
            .setSupplyType(sdk_1.TokenSupplyType.Finite)
            .setKycKey(kycKey.publicKey)
            .setFreezeKey(freezeKey.publicKey)
            .setAdminKey(adminKey.publicKey)
            .setMaxTransactionFee(new sdk_1.Hbar(10))
            .freezeWith(client);
        const signTx = await tx.sign(operatorKey);
        const response = await signTx.execute(client);
        const receipt = await response.getReceipt(client);
        if (!receipt || !receipt.tokenId) {
            throw new common_1.InternalServerErrorException('Token creation failed for property: ' + property.title);
        }
        return { tokenId: receipt?.tokenId.toString(), symbol };
    }
    async associateTokenWithVault(vaultId, vaultAccountId, tokenId) {
        const client = sdk_1.Client.forTestnet().setOperator(sdk_1.AccountId.fromString(this.config.adminId), sdk_1.PrivateKey.fromStringECDSA(this.config.adminKey));
        try {
            const tx = new sdk_1.TokenAssociateTransaction()
                .setAccountId(sdk_1.AccountId.fromString(vaultAccountId))
                .setTokenIds([tokenId])
                .setNodeAccountIds([new sdk_1.AccountId(3)])
                .setTransactionId(sdk_1.TransactionId.generate(vaultAccountId))
                .freeze();
            const signedTx = tx['_signedTransactions'].get(0);
            const txBodyHex = Buffer.from(signedTx.bodyBytes).toString('hex');
            const fbTx = await this.fireblocks.transactions.createTransaction({
                transactionRequest: {
                    operation: 'RAW',
                    assetId: 'HBAR_TEST',
                    source: { type: 'VAULT_ACCOUNT', id: vaultId },
                    extraParameters: {
                        rawMessageData: { messages: [{ content: txBodyHex }] },
                    },
                },
            });
            if (!fbTx || !fbTx.data || !fbTx.data.id) {
                throw new common_1.InternalServerErrorException('Fireblocks transaction failed');
            }
            let signatureBytes;
            while (!signatureBytes) {
                const details = await this.fireblocks.transactions.getTransaction({
                    txId: fbTx?.data?.id,
                });
                if (details.data.signedMessages &&
                    details.data.signedMessages?.length > 0 &&
                    details.data.signedMessages[0].signature?.fullSig) {
                    signatureBytes = Uint8Array.from(Buffer.from(details.data.signedMessages[0].signature.fullSig, 'hex'));
                }
                else {
                    await new Promise((resolve) => setTimeout(resolve, 3000));
                }
            }
            const info = new sdk_1.AccountInfoQuery().setAccountId(vaultAccountId);
            const accountInfo = await info.execute(client);
            const pubKey = sdk_1.PublicKey.fromBytesED25519(accountInfo.key._toProtobufKey().ed25519);
            tx.addSignature(pubKey, signatureBytes);
            const response = await tx.execute(client);
            const receipt = await response.getReceipt(client);
            return {
                success: true,
                status: receipt.status.toString(),
                accountId: vaultAccountId,
                tokenId,
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Associate token failed: ${error.message || error}`);
        }
    }
    async grantKyc(accountId, tokenId) {
        const operatorKey = sdk_1.PrivateKey.fromStringECDSA(this.config.adminKey);
        const operatorId = sdk_1.AccountId.fromString(this.config.adminId);
        const client = sdk_1.Client.forTestnet().setOperator(operatorId, operatorKey);
        try {
            const tx = await new sdk_1.TokenGrantKycTransaction()
                .setAccountId(accountId)
                .setTokenId(tokenId)
                .freezeWith(client)
                .sign(operatorKey);
            const result = await tx.execute(client);
            const receipt = await result.getReceipt(client);
            return { success: true, status: receipt.status.toString() };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Grant KYC failed: ${error.message || error}`);
        }
    }
    async transferFungibleToken(tokenId, to, toVaultId, amount, transaction, numOfUnits, decimals = 8) {
        const operatorKey = sdk_1.PrivateKey.fromStringECDSA(this.config.adminKey);
        const operatorId = sdk_1.AccountId.fromString(this.config.adminId);
        const client = sdk_1.Client.forTestnet().setOperator(operatorId, operatorKey);
        try {
            const transferAmount = numOfUnits * Math.pow(10, decimals);
            console.log({ transferAmount, to, amount, adminId: this.config.adminId });
            const transactionPayload = {
                assetId: 'HBAR_TEST',
                amount: amount,
                externalTxId: transaction.id,
                source: {
                    type: ts_sdk_1.TransferPeerPathType.VaultAccount,
                    id: toVaultId,
                },
                destination: {
                    type: ts_sdk_1.TransferPeerPathType.OneTimeAddress,
                    oneTimeAddress: {
                        address: this.config.adminId,
                    },
                },
                note: 'Your first transaction!',
            };
            const transactionResponse = await this.fireblocks.transactions.createTransaction({
                transactionRequest: transactionPayload,
                idempotencyKey: Math.random().toString(),
            });
            let status = transactionResponse.data.status;
            let transactionId = '';
            let transactionHash = '';
            console.log('Initial Fireblocks status:', status);
            while (status !== 'COMPLETED' && status !== 'FAILED') {
                const details = await this.fireblocks.transactions.getTransaction({
                    txId: transactionResponse.data.id,
                });
                status = details.data.status;
                transactionId = details.data.id || '';
                transactionHash = details.data.txHash || '';
                console.log('Current Fireblocks status:', status);
                await new Promise((resolve) => setTimeout(resolve, 3000));
            }
            if (status === 'FAILED') {
                throw new common_1.InternalServerErrorException('HBAR transfer failed');
            }
            const tx = await new sdk_1.TransferTransaction()
                .addTokenTransfer(tokenId, operatorId, -transferAmount)
                .addTokenTransfer(tokenId, sdk_1.AccountId.fromString(to), transferAmount)
                .freezeWith(client)
                .sign(operatorKey);
            const result = await tx.execute(client);
            const receipt = await result.getReceipt(client);
            return {
                success: true,
                transactionId,
                transactionHash,
                status: receipt.status.toString(),
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Transfer failed: ${error.message || error}`);
        }
    }
    async getTokenBalance(accountId, tokenId) {
        const client = sdk_1.Client.forTestnet().setOperator(sdk_1.AccountId.fromString(this.config.adminId), sdk_1.PrivateKey.fromStringECDSA(this.config.adminKey));
        const balance = await new sdk_1.AccountBalanceQuery()
            .setAccountId(sdk_1.AccountId.fromString(accountId))
            .execute(client);
        console.log(balance);
        if (!balance || !balance.tokens) {
            throw new common_1.InternalServerErrorException('Failed to fetch token balance');
        }
        const tokenBalance = balance.tokens._map.get(tokenId.toString());
        console.log(`Account ${accountId} has ${tokenBalance?.toString() ?? 0} units of token ${tokenId}`);
        return tokenBalance ?? 0;
    }
    async grantAndTransfer(accountId, toVaultId, tokenId, amount, transaction, numOfUnits) {
        await this.grantKyc(accountId, tokenId);
        return this.transferFungibleToken(tokenId, accountId, toVaultId, amount, transaction, numOfUnits);
    }
};
exports.FireblocksService = FireblocksService;
exports.FireblocksService = FireblocksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FireblocksService);
//# sourceMappingURL=fireblocks.service.js.map