export declare const CRYPTO_ASSETS: readonly ["usd-coin", "usd", "hedera-hashgraph"];
export declare const FIAT_CURRENCIES: readonly ["usd", "ngn"];
export declare const ALL_CURRENCIES: readonly ["usd-coin", "usd", "hedera-hashgraph", "usd", "ngn"];
export type CryptoAsset = (typeof CRYPTO_ASSETS)[number];
export type FiatCurrency = (typeof FIAT_CURRENCIES)[number];
export type Currency = (typeof ALL_CURRENCIES)[number];
export interface RateData {
    from: string;
    to: string;
    rate: string;
}
export declare class GetRateResponseDto {
    success: boolean;
    message: string;
    data: RateData;
}
export declare class GetQuoteRequestDto {
    from: CryptoAsset;
    to: Currency;
    amount?: number;
}
export interface QuoteData {
    from: string;
    to: string;
    rate: string;
}
export declare class GetQuoteResponseDto {
    success: boolean;
    message: string;
    data: QuoteData;
}
export declare class RateErrorResponseDto {
    success: boolean;
    message: string;
    code?: string;
}
export declare function isValidRatePair(from: string, to: string): boolean;
export declare function getSupportedPairs(): Array<{
    from: string;
    to: string;
}>;
