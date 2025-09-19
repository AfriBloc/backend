import { GetTransactionsDto } from 'src/dto/get-all-transactions.dto';
import { PortfolioItemService } from 'src/services/portfolio-item.service';
export declare class PortfolioController {
    private readonly portfolioItemService;
    constructor(portfolioItemService: PortfolioItemService);
    list(req: any, query: GetTransactionsDto): Promise<{
        status: string;
        data: {
            currentPage: number;
            pageSize: number;
            totalCount: number;
            totalPages: number;
            items: import("../entities/property-portfolio-item.entity").PortfolioItem[];
            totals: {
                currency: import("../entities/user-wallet.entity").Currency;
                totalPortfolio: string;
                totalIncome: any;
            };
        };
    }>;
}
