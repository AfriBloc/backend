import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  UserWallet,
  NetworkType,
  Currency,
} from '../entities/user-wallet.entity';
import { User } from '../entities/user.entity';
import { FireblocksService } from './fireblocks.service';
import { RateService } from './rate.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(UserWallet)
    private readonly walletRepository: Repository<UserWallet>,
    private readonly rateService: RateService,
    private readonly fireblocksService: FireblocksService,
  ) {}

  async createWallet(user: User): Promise<UserWallet> {
    try {
      // Call Fireblocks API to create a new wallet
      const fireblocksWallet = await this.createFireblocksWallet(user);

      const wallet = new UserWallet();
      wallet.user = user;
      wallet.networkType = NetworkType.TESTNET;
      wallet.vaultId = fireblocksWallet.vaultId;
      wallet.walletAddress = fireblocksWallet.address;
      wallet.evmAddress = fireblocksWallet.evmAddress;
      wallet.asset = fireblocksWallet.asset;
      wallet.currency = Currency.HBAR;
      wallet.isActive = true;
      wallet.balance = 0;

      return this.walletRepository.save(wallet);
    } catch (error) {
      throw new Error(`Failed to create wallet: ${error.message}`);
    }
  }

  private async createFireblocksWallet(user: User) {
    try {
      const response = await this.fireblocksService.createHederaWallet(user);
      return response;
    } catch (error) {
      throw new Error(`Failed to create Fireblocks wallet: ${error.message}`);
    }
  }
  catch(error) {
    throw new Error(`Fireblocks API error: ${error.message}`);
  }

  async getWalletBalance(userId: string) {
    const wallet = await this.walletRepository.findOne({
      where: { userId },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    try {
      const [hbarBalance, usdRate, ngnRate] = await Promise.all([
        this.fireblocksService.getWalletBalance(wallet),
        this.rateService.getRate('hedera-hashgraph', 'usd'),
        this.rateService.getRate('hedera-hashgraph', 'ngn'),
      ]);

      const balance = Number(hbarBalance);

      return {
        hbar: balance,
        usd: balance * Number(usdRate.rate),
        ngn: balance * Number(ngnRate.rate),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to get wallet balance: ${error.message}`,
      );
    }
  }

  async getUserWallet(userId: string): Promise<UserWallet> {
    const wallet = await this.walletRepository.findOneBy({ userId });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    return wallet;
  }

  async deactivateWallet(walletId: string): Promise<UserWallet> {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    wallet.isActive = false;
    return this.walletRepository.save(wallet);
  }

  async activateWallet(walletId: string): Promise<UserWallet> {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    wallet.isActive = true;
    return this.walletRepository.save(wallet);
  }
}
