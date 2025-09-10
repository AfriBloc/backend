import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from 'src/entities/property.entity';
import { FireblocksService } from 'src/services/fireblocks.service';
import { Repository } from 'typeorm';

@Injectable()
export class PropertyCreationListener {
  private readonly logger = new Logger(PropertyCreationListener.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly fireblocksService: FireblocksService,
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
  ) {}

  @OnEvent('property.created')
  async handlePropertyCreatedEvent(event: Property) {
    try {
      this.logger.log(
        `Handling property creation event for property ID: ${event.id}`,
      );
      const data = await this.fireblocksService.createFungibleKycToken(event);
      this.logger.log(`Successfully created token with ID: ${data.tokenId}`);

      event.tokenId = data.tokenId;
      event.tokenSymbol = data.symbol;
      await this.propertyRepo.save(event);
    } catch (error) {
      this.logger.error('Error handling property creation event:', error);
    }
  }
}
