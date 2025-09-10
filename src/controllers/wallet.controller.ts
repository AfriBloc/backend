import { Controller, Get, Request, Logger, UseGuards } from '@nestjs/common';
import { WalletService } from '../services/wallet.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('wallet')
export class WalletController {
  private readonly logger = new Logger(WalletController.name);

  constructor(private readonly walletService: WalletService) {}

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
}
