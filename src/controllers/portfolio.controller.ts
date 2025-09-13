import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { GetTransactionsDto } from 'src/dto/get-all-transactions.dto';
import { PortfolioItemService } from 'src/services/portfolio-item.service';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioItemService: PortfolioItemService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@Request() req, @Query() query: GetTransactionsDto) {
    return {
      status: 'success',
      data: await this.portfolioItemService.list(
        req.user.id,
        query.limit,
        query.page,
      ),
    };
  }
}
