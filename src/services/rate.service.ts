import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
// import { BitnobService } from './bitnob.service';
import { CacheService, TTL } from './cache.service';
import {
  isValidRatePair,
  RateData,
  QuoteData,
  CRYPTO_ASSETS,
  FIAT_CURRENCIES,
  GetQuoteRequestDto,
} from 'src/dto/rate.dto';
import { CoingeckoService } from './coingecko.service';

@Injectable()
export class RateService {
  private readonly logger = new Logger(RateService.name);

  constructor(
    private readonly coingeckoService: CoingeckoService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Get cached rate for a currency pair
   */
  async getRate(from: string, to: string): Promise<RateData> {
    // Validate currency pair
    if (!isValidRatePair(from, to)) {
      throw new BadRequestException(`Unsupported currency pair: ${from}/${to}`);
    }

    const cacheKey = `rate:${from}:${to}`;

    try {
      // Try to get from cache first
      const cachedRate = await this.cacheService.get<RateData>(cacheKey);
      if (cachedRate) {
        this.logger.log(`Rate found in cache for ${from}/${to}`);
        return cachedRate;
      }

      // If not in cache, fetch fresh rate
      this.logger.log(
        `Rate not in cache, fetching fresh rate for ${from}/${to}`,
      );
      const freshRate = await this.fetchRate(from, to);

      // Cache the fresh rate
      await this.cacheService.set(cacheKey, freshRate, TTL.ONE_HOUR);

      return freshRate;
    } catch (error) {
      this.logger.error(`Error getting rate for ${from}/${to}:`, error);
      throw new BadRequestException(
        `Failed to get rate for ${from}/${to}: ${error.message}`,
      );
    }
  }

  /**
   * Get live quote for currency conversion
   */
  async getQuote(request: GetQuoteRequestDto): Promise<QuoteData> {
    const { from, to } = request;

    // Validate currency pair
    if (!isValidRatePair(from, to)) {
      throw new BadRequestException(`Unsupported currency pair: ${from}/${to}`);
    }

    try {
      this.logger.log(`Getting live quote for ${from}/${to}`);

      if (this.isCryptoToFiat(from, to)) {
        return await this.getCryptoToFiatQuote({
          fromAsset: from as any,
          toCurrency: to as any,
        });
      } else {
        throw new BadRequestException(
          `Unsupported conversion type: ${from}/${to}`,
        );
      }
    } catch (error) {
      this.logger.error(`Error getting quote for ${from}/${to}:`, error);
      throw new BadRequestException(
        `Failed to get quote for ${from}/${to}: ${error.message}`,
      );
    }
  }

  /**
   * Fetch rate from Bitnob API
   */
  private async fetchRate(from: string, to: string): Promise<RateData> {
    try {
      if (this.isCryptoToFiat(from, to)) {
        const pairMap = {
          'usd-coin': 'usdc',
          'hedera-hashgraph': 'hbar',
          ngn: 'ngn',
          usd: 'usd',
        };
        const quote = await this.getCryptoToFiatQuote({
          fromAsset: from as any,
          toCurrency: to as any,
        });
        return {
          from: pairMap[from],
          to: pairMap[to],
          rate: quote.rate,
        };
      } else {
        throw new InternalServerErrorException(
          `Unsupported conversion type: ${from}/${to}`,
        );
      }
    } catch (error) {
      this.logger.error(`Error fetching rate for ${from}/${to}:`, error);
      throw error;
    }
  }

  /**
   * Get crypto-to-fiat quote
   */
  private async getCryptoToFiatQuote(params: {
    fromAsset: 'usd-coin' | 'hedera-hashgraph';
    toCurrency: 'ngn' | 'usd';
    amount?: number;
  }): Promise<QuoteData> {
    const price = await this.coingeckoService.getCryptoToFiatQuote(
      params.fromAsset,
      params.toCurrency,
    );

    return {
      from: params.fromAsset,
      to: params.toCurrency.toLowerCase(),
      rate: price,
    };
  }

  /**
   * Check if conversion is crypto-to-fiat
   */
  private isCryptoToFiat(from: string, to: string): boolean {
    return (
      CRYPTO_ASSETS.includes(from as any) && FIAT_CURRENCIES.includes(to as any)
    );
  }

  /**
   * Update all cached rates (runs hourly via cron)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async updateAllCachedRates(): Promise<void> {
    this.logger.log('Starting hourly rate update job');

    const pairs = [
      { from: 'hedera-hashgraph', to: 'ngn' },
      { from: 'hedera-hashgraph', to: 'usd' },
      { from: 'usd-coin', to: 'ngn' },
      { from: 'usd-coin', to: 'usd' },
      { from: 'usd', to: 'ngn' },
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const pair of pairs) {
      try {
        const cacheKey = `rate:${pair.from}:${pair.to}`;
        const rate = await this.fetchRate(pair.from, pair.to);
        await this.cacheService.set(cacheKey, rate, TTL.ONE_HOUR);
        successCount++;
        this.logger.log(`Updated rate for ${pair.from}/${pair.to}`);

        // Add small delay between requests to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        errorCount++;
        this.logger.error(
          `Failed to update rate for ${pair.from}/${pair.to}:`,
          error,
        );
      }
    }

    this.logger.log(
      `Rate update job completed. Success: ${successCount}, Errors: ${errorCount}`,
    );
  }

  /**
   * Manually trigger rate update for specific pair
   */
  async updateRate(from: string, to: string): Promise<RateData> {
    if (!isValidRatePair(from, to)) {
      throw new BadRequestException(`Unsupported currency pair: ${from}/${to}`);
    }

    try {
      const cacheKey = `rate:${from}:${to}`;
      const rate = await this.fetchRate(from, to);
      await this.cacheService.set(cacheKey, rate, TTL.ONE_HOUR);
      this.logger.log(`Manually updated rate for ${from}/${to}`);
      return rate;
    } catch (error) {
      this.logger.error(`Error updating rate for ${from}/${to}:`, error);
      throw new BadRequestException(
        `Failed to update rate for ${from}/${to}: ${error.message}`,
      );
    }
  }
}
