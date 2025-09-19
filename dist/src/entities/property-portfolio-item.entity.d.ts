import { User } from './user.entity';
import { Property } from './property.entity';
import { Currency } from './user-wallet.entity';
export declare class PortfolioItem {
    id: string;
    userId: string;
    propertyId: string;
    currency: Currency;
    user: User;
    property: Property;
    totalInvested: string;
    yield: string;
    unitsOwned: number;
    createdAt: Date;
    updatedAt: Date;
}
