import {
  IsString,
  IsOptional,
  IsNumber,
  IsIn,
  Min,
  ValidateIf,
} from 'class-validator';

// Supported currencies and assets
export const CRYPTO_ASSETS = ['usd-coin', 'usd', 'hedera-hashgraph'] as const;
export const FIAT_CURRENCIES = ['usd', 'ngn'] as const;
export const ALL_CURRENCIES = [...CRYPTO_ASSETS, ...FIAT_CURRENCIES] as const;

export type CryptoAsset = (typeof CRYPTO_ASSETS)[number];
export type FiatCurrency = (typeof FIAT_CURRENCIES)[number];
export type Currency = (typeof ALL_CURRENCIES)[number];

// Rate data interface
export interface RateData {
  from: string;
  to: string;
  rate: string;
}

// Get Rate Response DTO
export class GetRateResponseDto {
  success: boolean;

  message: string;

  data: RateData;
}

// Get Quote Request DTO
export class GetQuoteRequestDto {
  @IsString()
  @IsIn(CRYPTO_ASSETS)
  from: CryptoAsset;

  @IsString()
  @IsIn(ALL_CURRENCIES)
  to: Currency;

  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Amount must be greater than 0' })
  @ValidateIf((o) => !o.settlementAmount)
  amount?: number;
}

// Quote data interface
export interface QuoteData {
  from: string;
  to: string;
  rate: string;
}

// Get Quote Response DTO
export class GetQuoteResponseDto {
  success: boolean;

  message: string;

  data: QuoteData;
}

// Error Response DTO
export class RateErrorResponseDto {
  success: boolean;

  message: string;

  code?: string;
}

// Rate pair validation
export function isValidRatePair(from: string, to: string): boolean {
  const fromValid = ALL_CURRENCIES.includes(from as Currency);
  const toValid = ALL_CURRENCIES.includes(to as Currency);

  if (!fromValid || !toValid || from === to) {
    return false;
  }

  // Check if it's a supported conversion type
  const fromIsCrypto = CRYPTO_ASSETS.includes(from as CryptoAsset);
  const toIsCrypto = CRYPTO_ASSETS.includes(to as CryptoAsset);

  if (!fromIsCrypto || toIsCrypto) {
    return false;
  }

  return true;
}

// Get supported pairs
export function getSupportedPairs(): Array<{ from: string; to: string }> {
  const pairs: Array<{ from: string; to: string }> = [];

  for (const from of CRYPTO_ASSETS) {
    for (const to of ALL_CURRENCIES) {
      if (isValidRatePair(from, to)) {
        pairs.push({ from, to });
      }
    }
  }

  return pairs;
}
