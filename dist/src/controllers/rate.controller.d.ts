import { RateService } from '../services/rate.service';
import { GetQuoteRequestDto } from '../dto/rate.dto';
export declare class RateController {
    private readonly rateService;
    constructor(rateService: RateService);
    getSupportedPairs(): {
        success: boolean;
        message: string;
        data: {
            pairs: {
                from: string;
                to: string;
            }[];
            cryptoAssets: ("usd-coin" | "usd" | "hedera-hashgraph")[];
            fiatCurrencies: ("usd" | "ngn")[];
        };
    };
    getRate(from: string, to: string): Promise<{
        success: boolean;
        message: string;
        data: import("../dto/rate.dto").RateData;
    }>;
    getQuote(request: GetQuoteRequestDto): Promise<{
        success: boolean;
        message: string;
        data: import("../dto/rate.dto").QuoteData;
    }>;
    updateRate(from: string, to: string): Promise<{
        success: boolean;
        message: string;
        data: import("../dto/rate.dto").RateData;
    }>;
}
