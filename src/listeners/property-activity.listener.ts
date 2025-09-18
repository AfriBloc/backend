import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { PortfolioItem } from 'src/entities/property-portfolio-item.entity';
import { Property } from 'src/entities/property.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PropertyActivityListener {
  private readonly logger = new Logger(PropertyActivityListener.name);

  constructor(
    @InjectRepository(PortfolioItem)
    private readonly portfolioItemRepo: Repository<PortfolioItem>,
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
  ) {}

  @OnEvent('property.sold')
  async handlePropertySoldEvent(event: {
    property: Property;
    userId: string;
    numUnits: number;
    totalPrice: number;
  }) {
    try {
      this.logger.log(
        `Handling property sold event for property ID: ${event.property.id}`,
      );

      let portfolioItem = await this.portfolioItemRepo.findOne({
        where: { userId: event.userId, property: { id: event.property.id } },
        relations: ['property'],
      });

      if (portfolioItem) {
        portfolioItem.unitsOwned += event.numUnits;
        portfolioItem.totalInvested += event.totalPrice;
        portfolioItem = await this.portfolioItemRepo.save(portfolioItem);
      } else {
        portfolioItem = await this.portfolioItemRepo.save({
          userId: event.userId,
          property: event.property,
          unitsOwned: event.numUnits,
          totalInvested: event.totalPrice.toString(),
        });

        event.property.investorsCount += 1;
        await this.propertyRepo.save(event.property);
      }

      return portfolioItem;
    } catch (error) {
      this.logger.error('Error handling property sold event:', error);
    }
  }
}
