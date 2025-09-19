import { Property } from 'src/entities/property.entity';
import { FireblocksService } from 'src/services/fireblocks.service';
import { Repository } from 'typeorm';
export declare class PropertyCreationListener {
    private readonly fireblocksService;
    private readonly propertyRepo;
    private readonly logger;
    constructor(fireblocksService: FireblocksService, propertyRepo: Repository<Property>);
    handlePropertyCreatedEvent(event: Property): Promise<void>;
}
