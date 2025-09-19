import { Repository } from 'typeorm';
import { PortfolioItem } from '../entities/property-portfolio-item.entity';
import { Currency } from 'src/entities/user-wallet.entity';
export declare class PortfolioItemService {
    private readonly portfolioRepo;
    private readonly logger;
    constructor(portfolioRepo: Repository<PortfolioItem>);
    list(userId: string, limit?: number, offset?: number): Promise<{
        currentPage: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        items: PortfolioItem[];
        totals: {
            currency: Currency;
            totalPortfolio: string;
            totalIncome: any;
        };
    }>;
}
