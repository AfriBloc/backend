import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  MinLength,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class SubPropertyDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CreatePropertyDto {
  @IsString()
  @MinLength(1, { message: 'Title cannot be empty' })
  title: string;

  @IsString()
  @MinLength(10, { message: 'Description must be at least 10 characters' })
  description: string;

  @IsString()
  @MinLength(1, { message: 'Property type cannot be empty' })
  type: string;

  @IsNumber()
  @Min(0, { message: 'Kitchen count cannot be negative' })
  @Type(() => Number)
  kitchen: number;

  @IsNumber()
  @Min(0, { message: 'Dining count cannot be negative' })
  @Type(() => Number)
  dining: number;

  @IsNumber()
  @Min(0, { message: 'Bedroom count cannot be negative' })
  @Type(() => Number)
  bedrooms: number;

  @IsNumber()
  @Min(0, { message: 'Living room count cannot be negative' })
  @Type(() => Number)
  livingRoom: number;

  @IsNumber()
  @Min(0, { message: 'Bathroom count cannot be negative' })
  @Type(() => Number)
  bathroom: number;

  @IsString()
  @MinLength(1, { message: 'Land measurement cannot be empty' })
  landMeasurement: string;

  @IsString()
  @MinLength(1, { message: 'Location cannot be empty' })
  location: string;

  @IsNumber()
  @IsNotEmpty()
  propertyPrice: number;

  @IsNumber()
  @IsNotEmpty()
  numUnits: number;

  @IsOptional()
  @IsNumber()
  purchasePct?: number;

  @IsOptional()
  @IsNumber()
  transactionPct?: number;

  @IsOptional()
  @IsNumber()
  mofPct?: number;

  @IsString()
  @Transform(({ value }: { value: string }) => parseFloat(value).toFixed(2))
  netRentalYieldPct: string;

  @IsString()
  @Transform(({ value }: { value: string }) => parseFloat(value).toFixed(2))
  annualisedRoiPct: string;

  @IsString()
  @Transform(({ value }: { value: string }) => parseFloat(value).toFixed(2))
  grossRentalYieldPct: string;

  @IsString()
  @MinLength(1, { message: 'Funded date cannot be empty' })
  fundedDate: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  whyInvest?: string[];
}

export class SeedPropertyDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsString()
  @MinLength(1)
  type: string;

  @IsNumber()
  @Type(() => Number)
  kitchen: number;

  @IsNumber()
  @Type(() => Number)
  dining: number;

  @IsNumber()
  @Type(() => Number)
  bedrooms: number;

  @IsNumber()
  @Type(() => Number)
  livingRoom: number;

  @IsNumber()
  @Type(() => Number)
  bathroom: number;

  @IsString()
  @MinLength(1)
  landMeasurement: string;

  @IsString()
  @MinLength(1)
  location: string;

  @IsString()
  netRentalYieldPct: string;

  @IsString()
  annualisedRoiPct: string;

  @IsString()
  grossRentalYieldPct: string;

  @IsString()
  fundedDate: string;

  @IsNumber()
  @IsNotEmpty()
  propertyPrice: number;

  @IsNumber()
  @IsNotEmpty()
  numUnits: number;

  @IsOptional()
  @IsNumber()
  purchasePct?: number;

  @IsOptional()
  @IsNumber()
  transactionPct?: number;

  @IsOptional()
  @IsNumber()
  mofPct?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  whyInvest?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsString()
  governorsConsentUrl?: string | null;

  @IsOptional()
  @IsString()
  deedOfAssignmentUrl?: string | null;

  @IsOptional()
  @IsString()
  surveyPlanUrl?: string | null;

  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => SubPropertyDto)
  // subProperties: SubPropertyDto[];
}

export class SeedPropertiesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeedPropertyDto)
  properties: SeedPropertyDto[];
}
