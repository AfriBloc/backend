import { PortfolioItem } from 'src/entities/property-portfolio-item.entity';
import { Property } from 'src/entities/property.entity';
import { Repository } from 'typeorm';
export declare class PropertyActivityListener {
    private readonly portfolioItemRepo;
    private readonly propertyRepo;
    private readonly logger;
    constructor(portfolioItemRepo: Repository<PortfolioItem>, propertyRepo: Repository<Property>);
    handlePropertySoldEvent(event: {
        property: Property;
        userId: string;
        numUnits: number;
        totalPrice: number;
    }): Promise<PortfolioItem | undefined>;
}
