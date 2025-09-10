import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CoingeckoService {
  constructor(private readonly httpService: HttpService) {}

  async getCryptoToFiatQuote(
    fromAsset: string,
    toCurrency: string,
  ): Promise<string> {
    const baseUrl = 'https://api.coingecko.com/api/v3';

    const url = `${baseUrl}/simple/price?ids=${fromAsset}&vs_currencies=${toCurrency}`;

    try {
      const response = await firstValueFrom(this.httpService.get(url));

      const price = response.data[fromAsset][toCurrency];
      return price;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch rate from CoinGecko: ${error.message}`,
      );
    }
  }
}
