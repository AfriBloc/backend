import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Property } from '../entities/property.entity';
import { PortfolioItem } from '../entities/property-portfolio-item.entity';
import { CreatePropertyDto } from 'src/dto/create-property.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
    @InjectRepository(PortfolioItem)
    private readonly portfolioRepo: Repository<PortfolioItem>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async list(): Promise<Property[]> {
    return this.propertyRepo.find();
  }

  async getById(id: string): Promise<Property> {
    const property = await this.propertyRepo.findOne({
      where: { id },
    });
    if (!property) throw new NotFoundException('Property not found');
    return property;
  }

  /**
   * Creates a property and its sub-properties in a transaction.
   * @param propertyDto - The property DTO, including image/doc URLs
   * @param subProperties - Array of sub-property DTOs
   */
  async createFull(
    propertyDto: Partial<CreatePropertyDto> & {
      imageUrls?: string[];
      governorsConsentUrl?: string | null;
      deedOfAssignmentUrl?: string | null;
      surveyPlanUrl?: string | null;
    },
  ): Promise<Property> {
    return await this.dataSource.transaction(async (manager) => {
      // Only include valid columns for Property entity
      const costs = this.computeUnitCosts(
        propertyDto.propertyPrice ?? 0,
        propertyDto.purchasePct ?? 5,
        propertyDto.transactionPct ?? 5,
        propertyDto.mofPct ?? 3,
      );
      const property = this.propertyRepo.create({
        ...propertyDto,
        features: propertyDto.features ?? null,
        amenities: propertyDto.amenities ?? null,
        whyInvest: propertyDto.whyInvest ?? null,
        imageUrls: propertyDto.imageUrls ?? null,
        governorsConsentUrl: propertyDto.governorsConsentUrl ?? null,
        deedOfAssignmentUrl: propertyDto.deedOfAssignmentUrl ?? null,
        surveyPlanUrl: propertyDto.surveyPlanUrl ?? null,
        numUnits: propertyDto.numUnits ?? 0,
        pricePerUnit: this.toMoneyString(
          Number(costs.totalCost) / Number(propertyDto.numUnits ?? 1),
        ),
        purchaseCosts: costs.purchaseCosts,
        transactionFees: costs.transactionFees,
        mofFees: costs.mofFees,
        listingPrice: costs.totalCost,
      } as Partial<Property>);
      const savedProperty = await manager.save(Property, property);

      this.eventEmitter.emit('property.created', savedProperty);

      return savedProperty;
    });
  }

  private parseMoney(value: string | number): number {
    if (typeof value === 'number') return value;
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned || '0');
    return isNaN(parsed) ? 0 : parsed;
  }

  private toMoneyString(value: number): string {
    return value.toFixed(2);
  }

  computeUnitCosts(
    propertyPrice: string | number,
    purchasePct = 5,
    transactionPct = 5,
    mofPct = 3,
  ): {
    propertyPrice: string;
    purchaseCosts: string;
    transactionFees: string;
    mofFees: string;
    totalCost: string;
  } {
    const price = this.parseMoney(propertyPrice);
    const purchase = (purchasePct / 100) * price;
    const transaction = (transactionPct / 100) * price;
    const mof = (mofPct / 100) * price;
    const total = price + purchase + transaction + mof;
    return {
      propertyPrice: this.toMoneyString(price),
      purchaseCosts: this.toMoneyString(purchase),
      transactionFees: this.toMoneyString(transaction),
      mofFees: this.toMoneyString(mof),
      totalCost: this.toMoneyString(total),
    };
  }
}
