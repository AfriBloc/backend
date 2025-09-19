export declare class SubPropertyDto {
    name: string;
}
export declare class CreatePropertyDto {
    title: string;
    description: string;
    type: string;
    kitchen: number;
    dining: number;
    bedrooms: number;
    livingRoom: number;
    bathroom: number;
    landMeasurement: string;
    location: string;
    propertyPrice: number;
    numUnits: number;
    purchasePct?: number;
    transactionPct?: number;
    mofPct?: number;
    netRentalYieldPct: string;
    annualisedRoiPct: string;
    grossRentalYieldPct: string;
    fundedDate: string;
    features?: string[];
    amenities?: string[];
    whyInvest?: string[];
}
export declare class SeedPropertyDto {
    title: string;
    description: string;
    type: string;
    kitchen: number;
    dining: number;
    bedrooms: number;
    livingRoom: number;
    bathroom: number;
    landMeasurement: string;
    location: string;
    netRentalYieldPct: string;
    annualisedRoiPct: string;
    grossRentalYieldPct: string;
    fundedDate: string;
    propertyPrice: number;
    numUnits: number;
    purchasePct?: number;
    transactionPct?: number;
    mofPct?: number;
    features?: string[];
    amenities?: string[];
    whyInvest?: string[];
    imageUrls?: string[];
    governorsConsentUrl?: string | null;
    deedOfAssignmentUrl?: string | null;
    surveyPlanUrl?: string | null;
}
export declare class SeedPropertiesDto {
    properties: SeedPropertyDto[];
}
