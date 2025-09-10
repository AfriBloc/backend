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
} from '@fireblocks/ts-sdk';
import {
  Client,
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  AccountId,
  Hbar,
} from '@hashgraph/sdk';
import { User } from 'src/entities/user.entity';
import { getSecretsDir } from 'src/helpers/path.helper';
import { readFileSync } from 'fs';
import { Property } from 'src/entities/property.entity';

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

  async getWalletBalance(vaultAccountId: string) {
    try {
      const balance = await this.fireblocks.vaults.getVaultAccount({
        vaultAccountId: vaultAccountId,
      });

      return balance.data.assets;
    } catch (error) {
      throw new Error(
        `Fireblocks API error: ${error.response?.data || error.message}`,
      );
    }
  }

  generateSymbol(property: Property): string {
    const title = property.title.replace(/\s+/g, '').toUpperCase();
    const idSegment = property.id.split('-')[0].toUpperCase();
    return `${title.substring(0, 5)}${idSegment}`;
  }

  async createFungibleKycToken(property: Property) {
    const operatorKey = PrivateKey.fromStringECDSA(this.config.adminKey);
    const operatorId = AccountId.fromString(this.config.adminId);
    const client = Client.forTestnet().setOperator(operatorId, operatorKey);

    const kycKey = PrivateKey.fromStringECDSA(this.config.adminKey);
    const freezeKey = PrivateKey.fromStringECDSA(this.config.adminKey);
    const adminKey = PrivateKey.fromStringECDSA(this.config.adminKey);

    const tx = new TokenCreateTransaction()
      .setTokenName(`${property.title}`)
      .setTokenSymbol(this.generateSymbol(property))
      .setDecimals(8)
      .setInitialSupply(1000 * 1e8)
      .setMaxSupply(1000 * 1e8)
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

    return receipt?.tokenId.toString();
  }
}
