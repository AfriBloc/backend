import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class CoingeckoService {
    private readonly httpService;
    private readonly config;
    constructor(httpService: HttpService, config: ConfigService);
    getCryptoToFiatQuote(fromAsset: string, toCurrency: string): Promise<string>;
}
