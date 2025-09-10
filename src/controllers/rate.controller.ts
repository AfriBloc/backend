import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RateService } from '../services/rate.service';
import {
  GetQuoteRequestDto,
  CRYPTO_ASSETS,
  getSupportedPairs,
  FIAT_CURRENCIES,
} from '../dto/rate.dto';

@Controller('rates')
export class RateController {
  constructor(private readonly rateService: RateService) {}

  @Get('supported-pairs')
  getSupportedPairs() {
    const pairs = getSupportedPairs();
    return {
      success: true,
      message: 'Supported pairs retrieved successfully',
      data: {
        pairs,
        cryptoAssets: [...CRYPTO_ASSETS],
        fiatCurrencies: [...FIAT_CURRENCIES],
      },
    };
  }

  @Get(':from/:to')
  async getRate(@Param('from') from: string, @Param('to') to: string) {
    const pairMap = {
      usdc: 'usd-coin',
      hbar: 'hedera-hashgraph',
      ngn: 'ngn',
      usd: 'usd',
    };
    const mappedFrom = pairMap[from.toLowerCase()] || from.toLowerCase();
    const mappedTo = pairMap[to.toLowerCase()] || to.toLowerCase();
    const rate = await this.rateService.getRate(mappedFrom, mappedTo);
    return {
      success: true,
      message: 'Exchange rate retrieved successfully',
      data: rate,
    };
  }

  @Post('quote')
  @UseGuards(JwtAuthGuard)
  async getQuote(@Body(ValidationPipe) request: GetQuoteRequestDto) {
    const quote = await this.rateService.getQuote(request);
    return {
      success: true,
      message: 'Quote generated successfully',
      data: quote,
    };
  }

  @Post('update/:from/:to')
  @UseGuards(JwtAuthGuard)
  async updateRate(@Param('from') from: string, @Param('to') to: string) {
    const rate = await this.rateService.updateRate(
      from.toLowerCase(),
      to.toLowerCase(),
    );
    return {
      success: true,
      message: 'Rate updated successfully',
      data: rate,
    };
  }
}
