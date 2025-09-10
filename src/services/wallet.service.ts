import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  UserWallet,
  NetworkType,
  Currency,
} from '../entities/user-wallet.entity';
import { User } from '../entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { FireblocksService } from './fireblocks.service';
import axios from 'axios';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(UserWallet)
    private readonly walletRepository: Repository<UserWallet>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
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

  async getWalletBalance(walletId: string): Promise<number> {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    try {
      // TODO: Implement Fireblocks balance check
      // This is a placeholder for the actual balance check
      return wallet.balance;
    } catch (error) {
      throw new Error(`Failed to get wallet balance: ${error.message}`);
    }
  }

  async convertHbarToUsd(hbarAmount: number): Promise<number> {
    try {
      // TODO: Implement real-time rate fetching
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph&vs_currencies=usd`,
      );
      const rate = response.data['hedera-hashgraph'].usd;
      return hbarAmount * rate;
    } catch (error) {
      throw new Error(`Failed to convert HBAR to USD: ${error.message}`);
    }
  }

  async convertUsdToNgn(usdAmount: number): Promise<number> {
    try {
      // TODO: Implement real-time forex rate fetching
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/USD`,
      );
      const rate = response.data.rates.NGN;
      return usdAmount * rate;
    } catch (error) {
      throw new Error(`Failed to convert USD to NGN: ${error.message}`);
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
