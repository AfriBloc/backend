import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Property } from '../entities/property.entity';
import { PortfolioItem } from '../entities/property-portfolio-item.entity';
import { CreatePropertyDto } from 'src/dto/create-property.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FireblocksService } from './fireblocks.service';
import { WalletService } from './wallet.service';
import { RateService } from './rate.service';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from 'src/entities/transaction.entity';
import { TransactionReferenceService } from './transaction-reference.service';
import { Currency } from 'src/entities/user-wallet.entity';
import { MailService } from './mail.service';
import { User } from 'src/entities/user.entity';

@Injectable()
export class PropertiesService {
  private readonly logger = new Logger(PropertiesService.name);
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
    @InjectRepository(PortfolioItem)
    private readonly portfolioRepo: Repository<PortfolioItem>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
    private readonly fireblocksService: FireblocksService,
    private readonly walletService: WalletService,
    private readonly rateService: RateService,
    private readonly mailService: MailService,
    private readonly transactionRefService: TransactionReferenceService,
  ) {}

  async list(): Promise<Property[]> {
    const properties = await this.propertyRepo.find({
      relations: ['portfolioItems'],
    });

    for (const property of properties) {
      // Calculate investorsCount and unitsSold
      const investorsCount = property.portfolioItems.length;
      const unitsSold = property.portfolioItems.reduce(
        (sum, item) => sum + (item.unitsOwned || 0),
        0,
      );
      const initialUnits = unitsSold + property.numUnits;

      // Update property object
      property.investorsCount = investorsCount;
      property.unitsSold = unitsSold;
      property.initialUnits = initialUnits;

      // Save back to DB
      await this.propertyRepo.save(property);
    }

    return properties;
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

  async purchasePropertyUnits(
    user: User,
    propertyId: string,
    numUnits: number,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      // 1. Fetch property
      let property = await manager.findOne(Property, {
        where: { id: propertyId },
      });
      if (!property) throw new NotFoundException('Property not found');

      if (property.numUnits < numUnits) {
        throw new BadRequestException('Not enough units available');
      }

      if (!property.tokenId) {
        throw new BadRequestException('Property token not yet created');
      }

      // 2. Fetch user wallet
      const userWallet = await this.walletService.getUserWallet(user.id);
      if (!userWallet?.walletAddress) {
        throw new BadRequestException('User wallet not found');
      }

      // 3. Price calculations
      const price = Number(property.pricePerUnit) * numUnits;
      const totalPrice = Number(price.toFixed(2));
      const hbarRate = await this.rateService.getRate(
        'hedera-hashgraph',
        'ngn',
      );
      if (!hbarRate?.rate || Number(hbarRate.rate) <= 0) {
        throw new BadRequestException('Invalid HBAR/NGN rate');
      }

      const totalPriceInHbar = totalPrice / Number(hbarRate.rate);
      const userBalance = await this.walletService.getWalletBalance(user.id);
      if (userBalance.hbar < totalPriceInHbar) {
        throw new BadRequestException('Insufficient wallet balance');
      }

      this.logger.log(
        `User ${user.id} purchasing ${numUnits} units of property ${propertyId}`,
      );
      this.logger.log(
        `Total price: ${totalPrice.toFixed()} NGN (${totalPriceInHbar.toFixed()} HBAR)`,
      );

      // 4. Associate token (ignore already-associated error)
      const portfolioItem = await this.portfolioRepo.findOne({
        where: { userId: user.id, propertyId },
        relations: ['property'],
      });

      if (!portfolioItem) {
        try {
          const associationStatus =
            await this.fireblocksService.associateTokenWithVault(
              userWallet.vaultId,
              userWallet.walletAddress,
              property.tokenId,
            );
          this.logger.log(
            `Token association: ${JSON.stringify(associationStatus)}`,
          );
        } catch (err) {
          if (!err.message.includes('TOKEN_ALREADY_ASSOCIATED')) {
            throw err;
          }
          this.logger.warn(
            `Token already associated for ${userWallet.walletAddress}`,
          );
        }
      }

      // ✅ 5. Create a transaction leg BEFORE transfer
      const reference = this.transactionRefService.generate();
      let transactionLeg = manager.create(Transaction, {
        userId: user.id,
        walletType: userWallet.walletType,
        transactionType: TransactionType.DEBIT,
        status: TransactionStatus.PENDING,
        amount: totalPriceInHbar.toFixed(8),
        reference,
        currency: Currency.HBAR,
        address: userWallet.walletAddress,
        network: userWallet.networkType,
        spotPrice: Number(hbarRate.rate),
        description: `Purchase of ${numUnits} units of property ${propertyId}`,
      });
      await manager.save(transactionLeg);

      try {
        // 6. Perform Fireblocks transfer
        const transferResult = await this.fireblocksService.grantAndTransfer(
          userWallet.walletAddress,
          userWallet.vaultId,
          property.tokenId,
          Number(totalPriceInHbar),
          transactionLeg,
          numUnits,
        );

        // Update transaction leg with Fireblocks details
        transactionLeg.status = TransactionStatus.SUCCESS;
        transactionLeg.fireblockTransactionId =
          transferResult?.transactionId ?? null;
        transactionLeg.hash = transferResult?.transactionHash ?? null;
        transactionLeg = await manager.save(transactionLeg);

        // 7. Update property state (e.g., reduce available units)
        property.numUnits -= numUnits;
        property.unitsSold += numUnits;
        property = await manager.save(property);

        this.eventEmitter.emit('property.sold', {
          property,
          userId: user.id,
          numUnits,
          totalPrice,
        });

        this.mailService.sendPropertyPurchasedEmail(
          transactionLeg,
          property,
          user,
          totalPrice,
          numUnits,
        );

        this.logger.log(`Transfer result: ${JSON.stringify(transferResult)}`);
        return {
          message: 'Purchase successful',
          transaction: transactionLeg,
        };
      } catch (error) {
        // mark as failed if transfer fails
        transactionLeg.status = TransactionStatus.FAILED;
        await manager.save(transactionLeg);
        throw error;
      }
    });
  }
}
