import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CustodialWalletService,
  FireblocksConfig,
} from '@hashgraph/hedera-custodians-integration';
import {
  Fireblocks,
  BasePath,
  VaultAccount,
  FireblocksResponse,
  TransferPeerPathType,
} from '@fireblocks/ts-sdk';
import {
  Client,
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  AccountId,
  Hbar,
  TransferTransaction,
  TokenGrantKycTransaction,
  PublicKey,
  AccountInfoQuery,
  TokenAssociateTransaction,
  TransactionId,
  AccountBalanceQuery,
} from '@hashgraph/sdk';
import { User } from 'src/entities/user.entity';
import { getSecretsDir } from 'src/helpers/path.helper';
import { readFileSync } from 'fs';
import { Property } from 'src/entities/property.entity';
import { UserWallet } from 'src/entities/user-wallet.entity';
import { Transaction } from 'src/entities/transaction.entity';

@Injectable()
export class FireblocksService {
  private readonly config: any;
  private readonly fireblocks: Fireblocks;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      apiKey: this.configService.get<string>('fireblocks.apiKey') || '',
      apiSecretKey: readFileSync(
        getSecretsDir('fireblocks_secret.key'),
        'utf8',
      ),
      baseUrl: BasePath.Sandbox,
      adminKey: this.configService.get<string>('fireblocks.adminKey') || '',
      adminId: this.configService.get<string>('fireblocks.adminId') || '',
    };
    this.fireblocks = new Fireblocks({
      apiKey: this.config.apiKey,
      basePath: BasePath.Sandbox,
      secretKey: this.config.apiSecretKey,
    });
  }

  async createVaultAccount(
    userId: string,
    email: string,
  ): Promise<FireblocksResponse<VaultAccount>> {
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
    } catch (e) {
      console.log(e);
      throw new Error(`Fireblocks API error: ${e.response?.data || e.message}`);
    }
  }

  async activateAsset(vault: FireblocksResponse<VaultAccount>) {
    const idemKey = Math.random();
    if (!vault?.data?.id) {
      throw new InternalServerErrorException('Invalid vault account ID');
    }

    try {
      const wallet = await this.fireblocks.vaults.activateAssetForVaultAccount({
        vaultAccountId: vault?.data?.id,
        assetId: 'HBAR_TEST', //Hardcoded assetId
        idempotencyKey: idemKey.toString(),
      });

      return wallet;
    } catch (e) {
      console.log(e);
    }
  }

  async createHederaWallet(user: User): Promise<{
    vaultId: string;
    address: string;
    evmAddress: string;
    asset: string;
  }> {
    try {
      const vault = await this.createVaultAccount(user.id, user.email);

      const wallet = await this.activateAsset(vault);
      const hcsAddress = wallet?.data?.address; //Deposit address in Hedera format //0.0.6761316
      if (!hcsAddress) {
        console.log('Failed to retrieve HCS address');
        throw new InternalServerErrorException(
          'Failed to retrieve HCS address',
        );
      }
      const evmAddress = AccountId.fromString(hcsAddress).toEvmAddress();

      const config = new FireblocksConfig(
        process.env.FIREBLOCKS_API_KEY as string,
        this.config.apiSecretKey,
        BasePath.Sandbox,
        vault.data.id as string,
        'HBAR_TEST',
      );

      new CustodialWalletService(config);

      return {
        vaultId: vault.data.id as string,
        address: hcsAddress,
        evmAddress: evmAddress,
        asset: 'HBAR_TEST',
      };
    } catch (error) {
      throw new Error(
        `Fireblocks API error: ${error.response?.data || error.message}`,
      );
    }
  }

  async getWalletBalance(wallet: UserWallet) {
    try {
      const balance = await this.fireblocks.vaults.getVaultAccount({
        vaultAccountId: wallet.vaultId,
      });

      if (!balance || !balance.data || !balance.data.assets) {
        throw new InternalServerErrorException(
          'Failed to fetch wallet balance',
        );
      }

      console.log(balance.data.assets);
      const hbar_balance = balance?.data?.assets.find(
        (asset) => asset.id === 'HBAR_TEST',
      )?.available;

      return hbar_balance;
    } catch (error) {
      throw new Error(
        `Fireblocks API error: ${error.response?.data || error.message}`,
      );
    }
  }

  generateSymbol(property: Property): string {
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

    const randomNumber = Math.floor(100 + Math.random() * 900); // 100–999

    return `${titleSegment}${locationSegment}${idSegment}${randomNumber}`;
  }

  async createFungibleKycToken(property: Property) {
    const operatorKey = PrivateKey.fromStringECDSA(this.config.adminKey);
    const operatorId = AccountId.fromString(this.config.adminId);
    const client = Client.forTestnet().setOperator(operatorId, operatorKey);

    const kycKey = PrivateKey.fromStringECDSA(this.config.adminKey);
    const freezeKey = PrivateKey.fromStringECDSA(this.config.adminKey);
    const adminKey = PrivateKey.fromStringECDSA(this.config.adminKey);
    const symbol = this.generateSymbol(property);

    const tx = new TokenCreateTransaction()
      .setTokenName(`${property.title}`)
      .setTokenSymbol(symbol)
      .setDecimals(8)
      .setInitialSupply(property.numUnits * 1e8)
      .setMaxSupply(property.numUnits * 1e8)
      .setTreasuryAccountId(operatorId)
      .setTokenType(TokenType.FungibleCommon)
      .setSupplyType(TokenSupplyType.Finite)
      .setKycKey(kycKey.publicKey)
      .setFreezeKey(freezeKey.publicKey)
      .setAdminKey(adminKey.publicKey)
      .setMaxTransactionFee(new Hbar(10))
      .freezeWith(client);

    const signTx = await tx.sign(operatorKey);
    const response = await signTx.execute(client);
    const receipt = await response.getReceipt(client);
    if (!receipt || !receipt.tokenId) {
      throw new InternalServerErrorException(
        'Token creation failed for property: ' + property.title,
      );
    }

    return { tokenId: receipt?.tokenId.toString(), symbol };
  }

  async associateTokenWithVault(
    vaultId: string,
    vaultAccountId: string,
    tokenId: string,
  ) {
    const client = Client.forTestnet().setOperator(
      AccountId.fromString(this.config.adminId),
      PrivateKey.fromStringECDSA(this.config.adminKey),
    );
    try {
      const tx = new TokenAssociateTransaction()
        .setAccountId(AccountId.fromString(vaultAccountId))
        .setTokenIds([tokenId])
        .setNodeAccountIds([new AccountId(3)]) // pick a node
        .setTransactionId(TransactionId.generate(vaultAccountId))
        .freeze();

      const signedTx = tx['_signedTransactions'].get(0);
      const txBodyHex = Buffer.from(signedTx.bodyBytes as Uint8Array).toString(
        'hex',
      );

      // Send to Fireblocks for signing
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
        throw new InternalServerErrorException('Fireblocks transaction failed');
      }
      // Poll Fireblocks until signature is ready
      let signatureBytes: Uint8Array | undefined;
      while (!signatureBytes) {
        const details = await this.fireblocks.transactions.getTransaction({
          txId: fbTx?.data?.id,
        });

        if (
          details.data.signedMessages &&
          details.data.signedMessages?.length > 0 &&
          details.data.signedMessages[0].signature?.fullSig
        ) {
          signatureBytes = Uint8Array.from(
            Buffer.from(
              details.data.signedMessages[0].signature.fullSig,
              'hex',
            ),
          );
        } else {
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }

      // Fetch vault public key from Hedera
      const info = new AccountInfoQuery().setAccountId(vaultAccountId);
      const accountInfo = await info.execute(client);

      const pubKey = PublicKey.fromBytesED25519(
        accountInfo.key._toProtobufKey().ed25519!,
      );
      // Attach Fireblocks signature
      tx.addSignature(pubKey, signatureBytes);

      // Submit transaction
      const response = await tx.execute(client);
      const receipt = await response.getReceipt(client);

      return {
        success: true,
        status: receipt.status.toString(),
        accountId: vaultAccountId,
        tokenId,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Associate token failed: ${error.message || error}`,
      );
    }
  }

  /**
   * 🔹 Grant KYC for a token
   */
  async grantKyc(accountId: string, tokenId: string) {
    const operatorKey = PrivateKey.fromStringECDSA(this.config.adminKey);
    const operatorId = AccountId.fromString(this.config.adminId);
    const client = Client.forTestnet().setOperator(operatorId, operatorKey);

    try {
      const tx = await new TokenGrantKycTransaction()
        .setAccountId(accountId)
        .setTokenId(tokenId)
        .freezeWith(client)
        .sign(operatorKey);

      const result = await tx.execute(client);
      const receipt = await result.getReceipt(client);

      return { success: true, status: receipt.status.toString() };
    } catch (error) {
      throw new InternalServerErrorException(
        `Grant KYC failed: ${error.message || error}`,
      );
    }
  }

  /**
   * 🔹 Transfer fungible tokens
   */
  async transferFungibleToken(
    tokenId: string,
    to: string,
    toVaultId: string,
    amount: number,
    transaction: Transaction,
    numOfUnits: number,
    decimals = 8,
  ) {
    const operatorKey = PrivateKey.fromStringECDSA(this.config.adminKey);
    const operatorId = AccountId.fromString(this.config.adminId);
    const client = Client.forTestnet().setOperator(operatorId, operatorKey);

    try {
      const transferAmount = numOfUnits * Math.pow(10, decimals);
      console.log({ transferAmount, to, amount, adminId: this.config.adminId });

      const transactionPayload = {
        assetId: 'HBAR_TEST',
        amount: amount,
        externalTxId: transaction.id,
        source: {
          type: TransferPeerPathType.VaultAccount,
          id: toVaultId,
        },
        destination: {
          type: TransferPeerPathType.OneTimeAddress,
          oneTimeAddress: {
            address: this.config.adminId,
          },
        },
        note: 'Your first transaction!',
      };
      const transactionResponse =
        await this.fireblocks.transactions.createTransaction({
          transactionRequest: transactionPayload,
          idempotencyKey: Math.random().toString(),
        });
      let status = transactionResponse.data.status;
      let transactionId: string = '';
      let transactionHash: string = '';
      console.log('Initial Fireblocks status:', status);
      while (status !== 'COMPLETED' && status !== 'FAILED') {
        const details = await this.fireblocks.transactions.getTransaction({
          txId: transactionResponse.data.id as string,
        });
        status = details.data.status;
        transactionId = details.data.id || '';
        transactionHash = details.data.txHash || '';
        console.log('Current Fireblocks status:', status);

        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      if (status === 'FAILED') {
        throw new InternalServerErrorException('HBAR transfer failed');
      }

      const tx = await new TransferTransaction()
        .addTokenTransfer(tokenId, operatorId, -transferAmount)
        .addTokenTransfer(tokenId, AccountId.fromString(to), transferAmount)
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
    } catch (error) {
      throw new InternalServerErrorException(
        `Transfer failed: ${error.message || error}`,
      );
    }
  }

  async getTokenBalance(accountId: string, tokenId: string) {
    const client = Client.forTestnet().setOperator(
      AccountId.fromString(this.config.adminId),
      PrivateKey.fromStringECDSA(this.config.adminKey),
    );

    const balance = await new AccountBalanceQuery()
      .setAccountId(AccountId.fromString(accountId))
      .execute(client);

    // `balance.tokens` is a Map of tokenId → BigNumber

    console.log(balance);

    if (!balance || !balance.tokens) {
      throw new InternalServerErrorException('Failed to fetch token balance');
    }
    const tokenBalance = balance.tokens._map.get(tokenId.toString());

    console.log(
      `Account ${accountId} has ${tokenBalance?.toString() ?? 0} units of token ${tokenId}`,
    );

    return tokenBalance ?? 0;
  }

  /**
   * 🔹 Grant KYC then transfer
   */
  async grantAndTransfer(
    accountId: string,
    toVaultId: string,
    tokenId: string,
    amount: number,
    transaction: Transaction,
    numOfUnits: number,
  ) {
    await this.grantKyc(accountId, tokenId);
    return this.transferFungibleToken(
      tokenId,
      accountId,
      toVaultId,
      amount,
      transaction,
      numOfUnits,
    );
  }
}
