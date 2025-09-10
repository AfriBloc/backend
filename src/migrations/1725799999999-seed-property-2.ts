import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedProperty21725799999999 implements MigrationInterface {
  name = 'SeedProperty21725799999999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.getRepository('properties').insert({
      id: 'prop-2-seed-0001',
      title: '4-Bedroom Terrace Duplex',
      description:
        'A contemporary 4-bedroom terrace duplex in a serene Orchid Road environment. All rooms are ensuite with a spacious living area and a functional BQ.',
      num_bedrooms: 4,
      num_rooms: '4 Bedrooms + BQ (all ensuite)',
      land_measurement: '300sqm',
      location: 'Orchid Road, Lekki, Lagos',
      listing_price: '97650000',
      price_per_unit: '19530',
      num_units: 5000,
      investment_property_price: '90000000',
      investment_purchase_costs: '4500000',
      investment_transaction_fees: '1800000',
      investment_mof_fees: '1350000',
      investment_total: '97650000',
      net_rental_yield_pct: '6',
      annualised_roi_pct: '15',
      gross_rental_yield_pct: '8',
      funded_date: 'Upon full payment & documentation',
      total_property_cost: '97650000',
      features:
        '4 Bedrooms (all ensuite); Living Room; Kitchen & Dining; BQ; Bathrooms (5 including visitor’s toilet)',
      amenities:
        'Contemporary finishing & spotlights; Ensuite bedrooms; Boys’ Quarters (BQ); Spacious living and dining areas; Serene environment; Secure access',
      why_invest:
        'Prime location (Orchid is one of the fastest-growing areas in Lekki). High rental demand (expat & upper-middle class market). Strong capital appreciation potential (Lekki corridor ~10–15% yearly). Ready title: Governor’s Consent. Perfect for rental income and long-term wealth creation.',
      documents_list: 'Governor’s Consent; Deed of Assignment; Survey Plan',
      created_at: new Date(),
      updated_at: new Date(),
    } as any);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "DELETE FROM properties WHERE id = 'prop-2-seed-0001'",
    );
  }
}
