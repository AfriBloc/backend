import { CacheService } from './cache.service';
import { RateData, QuoteData, GetQuoteRequestDto } from 'src/dto/rate.dto';
import { CoingeckoService } from './coingecko.service';
export declare class RateService {
    private readonly coingeckoService;
    private readonly cacheService;
    private readonly logger;
    constructor(coingeckoService: CoingeckoService, cacheService: CacheService);
    getRate(from: string, to: string): Promise<RateData>;
    getQuote(request: GetQuoteRequestDto): Promise<QuoteData>;
    private fetchRate;
    private getCryptoToFiatQuote;
    private isCryptoToFiat;
    updateAllCachedRates(): Promise<void>;
    updateRate(from: string, to: string): Promise<RateData>;
}
