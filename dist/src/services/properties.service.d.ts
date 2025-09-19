import { Repository, DataSource } from 'typeorm';
import { Property } from '../entities/property.entity';
import { PortfolioItem } from '../entities/property-portfolio-item.entity';
import { CreatePropertyDto } from 'src/dto/create-property.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FireblocksService } from './fireblocks.service';
import { WalletService } from './wallet.service';
import { RateService } from './rate.service';
import { Transaction } from 'src/entities/transaction.entity';
import { TransactionReferenceService } from './transaction-reference.service';
import { MailService } from './mail.service';
import { User } from 'src/entities/user.entity';
export declare class PropertiesService {
    private readonly propertyRepo;
    private readonly portfolioRepo;
    private readonly dataSource;
    private readonly eventEmitter;
    private readonly fireblocksService;
    private readonly walletService;
    private readonly rateService;
    private readonly mailService;
    private readonly transactionRefService;
    private readonly logger;
    constructor(propertyRepo: Repository<Property>, portfolioRepo: Repository<PortfolioItem>, dataSource: DataSource, eventEmitter: EventEmitter2, fireblocksService: FireblocksService, walletService: WalletService, rateService: RateService, mailService: MailService, transactionRefService: TransactionReferenceService);
    list(): Promise<Property[]>;
    getById(id: string): Promise<Property>;
    createFull(propertyDto: Partial<CreatePropertyDto> & {
        imageUrls?: string[];
        governorsConsentUrl?: string | null;
        deedOfAssignmentUrl?: string | null;
        surveyPlanUrl?: string | null;
    }): Promise<Property>;
    private parseMoney;
    private toMoneyString;
    computeUnitCosts(propertyPrice: string | number, purchasePct?: number, transactionPct?: number, mofPct?: number): {
        propertyPrice: string;
        purchaseCosts: string;
        transactionFees: string;
        mofFees: string;
        totalCost: string;
    };
    purchasePropertyUnits(user: User, propertyId: string, numUnits: number): Promise<{
        message: string;
        transaction: Transaction;
    }>;
}
