import {
  Controller,
  Get,
  Request,
  Logger,
  UseGuards,
  Query,
} from '@nestjs/common';
import { WalletService } from '../services/wallet.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { FireblocksService } from 'src/services/fireblocks.service';
import { TransactionService } from 'src/services/transaction.service';
import { GetTransactionsDto } from 'src/dto/get-all-transactions.dto';

@Controller('wallet')
export class WalletController {
  private readonly logger = new Logger(WalletController.name);

  constructor(
    private readonly walletService: WalletService,
    private readonly fireblocksService: FireblocksService,
    private readonly transactionService: TransactionService,
  ) {}

  /**
   * Get user wallets
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserWallet(@Request() req) {
    const userId = req.user.id;
    const wallet = await this.walletService.getUserWallet(userId);
    return {
      status: 'success',
      data: wallet,
    };
  }

  /**
   * Get wallet balance
   */
  @Get('balance')
  @UseGuards(JwtAuthGuard)
  async getWalletBalance(@Request() req) {
    const userId = req.user.id;
    const balance = await this.walletService.getWalletBalance(userId);
    return {
      status: 'success',
      data: { balance },
    };
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  async getWalletTransactions(
    @Request() req,
    @Query() query: GetTransactionsDto,
  ) {
    const userId = req.user.id;
    const transactions = await this.transactionService.getUserTransactions(
      userId,
      query.limit,
      query.page,
    );
    return {
      status: 'success',
      data: transactions,
    };
  }

  @Get('token/balance')
  @UseGuards(JwtAuthGuard)
  async getTokenBalance(@Request() req) {
    const userId = req.user.id;
    const userWallet = await this.walletService.getUserWallet(userId);
    const balance = await this.fireblocksService.getTokenBalance(
      userWallet.walletAddress,
      '0.0.6800109',
    );
    return {
      status: 'success',
      data: { balance },
    };
  }
}
