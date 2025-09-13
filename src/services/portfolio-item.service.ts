import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortfolioItem } from '../entities/property-portfolio-item.entity';
import { Currency } from 'src/entities/user-wallet.entity';

@Injectable()
export class PortfolioItemService {
  private readonly logger = new Logger(PortfolioItemService.name);
  constructor(
    @InjectRepository(PortfolioItem)
    private readonly portfolioRepo: Repository<PortfolioItem>,
  ) {}

  async list(userId: string, limit: number = 10, offset: number = 1) {
    const query = this.portfolioRepo
      .createQueryBuilder('PortfolioItem')
      .leftJoinAndSelect('PortfolioItem.user', 'user')
      .leftJoinAndSelect('PortfolioItem.property', 'property')
      .where('PortfolioItem.userId = :userId', { userId })
      .orderBy('PortfolioItem.createdAt', 'DESC')
      .take(limit)
      .skip(limit * ((offset ?? 1) - 1));

    const totals = await this.portfolioRepo
      .createQueryBuilder('PortfolioItem')
      .select(
        'COALESCE(SUM("PortfolioItem"."total_invested"), 0)::numeric',
        'totalInvested',
      )
      .addSelect(
        'COALESCE(SUM("PortfolioItem"."yield"), 0)::numeric',
        'totalYield',
      )
      .where('"PortfolioItem"."user_id" = :userId', { userId })
      .getRawOne();

    const [items, totalCount] = await query.getManyAndCount();

    const totalPages = Math.ceil(totalCount / limit);

    const totalPortfolio =
      Number(totals.totalInvested) + Number(totals.totalYield);

    return {
      currentPage: offset,
      pageSize: limit,
      totalCount: totalCount,
      totalPages: totalPages,
      items,
      totals: {
        currency: Currency.NGN,
        totalPortfolio: totalPortfolio.toFixed(2),
        totalIncome: totals.totalYield ?? '0',
      },
    };
  }
}
