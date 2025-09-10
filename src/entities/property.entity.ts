import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PortfolioItem } from './property-portfolio-item.entity';
// import { SubProperty } from './sub-property.entity';
import { Expose } from 'class-transformer';
import { Currency } from './user-wallet.entity';

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  type: string; // e.g. Apartment Terrace, Duplex, Bungalow

  // Structured rooms
  @Column({ name: 'kitchen', type: 'int', default: 0 })
  kitchen: number;

  @Column({ name: 'dining', type: 'int', default: 0 })
  dining: number;

  @Column({ name: 'bedrooms', type: 'int', default: 0 })
  bedrooms: number;

  @Column({ name: 'living_room', type: 'int', default: 0 })
  livingRoom: number;

  @Column({ name: 'bathroom', type: 'int', default: 0 })
  bathroom: number;

  @Column({ name: 'land_measurement', type: 'varchar', length: 100 })
  landMeasurement: string;

  @Column({ type: 'varchar', length: 255 })
  location: string;

  @Column({ name: 'price_per_unit', type: 'numeric', precision: 18, scale: 2 })
  pricePerUnit: string;

  @Column({ name: 'num_units', type: 'int' })
  numUnits: number;

  @Column({ name: 'property_price', type: 'numeric', precision: 18, scale: 2 })
  propertyPrice: string;

  @Column({ name: 'purchase_costs', type: 'numeric', precision: 18, scale: 2 })
  purchaseCosts: string; // e.g., 5% of property price

  @Column({
    name: 'transaction_fees',
    type: 'numeric',
    precision: 18,
    scale: 2,
  })
  transactionFees: string;

  @Column({ name: 'mof_fees', type: 'numeric', precision: 18, scale: 2 })
  mofFees: string;

  @Column({ name: 'total_cost', type: 'numeric', precision: 18, scale: 2 })
  listingPrice: string;

  // Computed: number of unique investors (users with portfolio items for this property)
  @Expose()
  get investorsCount(): number {
    return Array.isArray(this.portfolioItems) ? this.portfolioItems.length : 0;
  }

  // Computed: total number of units sold (sum of unitsOwned in all portfolio items)
  @Expose()
  get unitsSold(): number {
    if (!Array.isArray(this.portfolioItems)) return 0;
    return this.portfolioItems.reduce(
      (sum, item) => sum + (item.unitsOwned || 0),
      0,
    );
  }

  // Yields and ROI
  @Column({
    name: 'net_rental_yield_pct',
    type: 'numeric',
    precision: 5,
    scale: 2,
  })
  netRentalYieldPct: string;

  @Column({
    name: 'annualised_roi_pct',
    type: 'numeric',
    precision: 5,
    scale: 2,
  })
  annualisedRoiPct: string;

  @Column({
    name: 'gross_rental_yield_pct',
    type: 'numeric',
    precision: 5,
    scale: 2,
  })
  grossRentalYieldPct: string;

  @Column({ name: 'funded_date', type: 'varchar', length: 255 })
  fundedDate: string;

  // Bullet points and features
  @Column({
    name: 'features',
    type: 'text',
    array: true,
    default: [],
    nullable: true,
  })
  features: string | null;

  @Column({
    name: 'amenities',
    type: 'text',
    array: true,
    default: [],
    nullable: true,
  })
  amenities: string | null;

  @Column({
    name: 'why_invest',
    type: 'text',
    array: true,
    default: [],
    nullable: true,
  })
  whyInvest: string | null;

  @Column({ name: 'image_urls', type: 'text', array: true, nullable: true })
  imageUrls: string[] | null;

  @Column({
    name: 'currency',
    type: 'enum',
    enum: Currency,
    default: Currency.NGN,
  })
  currency: Currency;

  @Column({
    name: 'governors_consent_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  governorsConsentUrl: string | null;

  @Column({
    name: 'deed_of_assignment_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  deedOfAssignmentUrl: string | null;

  @Column({
    name: 'survey_plan_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  surveyPlanUrl: string | null;

  @Column({ name: 'token_id', type: 'varchar', length: 255, nullable: true })
  tokenId: string | null;

  @Column({
    name: 'token_symbol',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  tokenSymbol: string | null;

  @OneToMany(() => PortfolioItem, (item) => item.property)
  portfolioItems: PortfolioItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
