import { IsOptional, IsString } from 'class-validator';

export class GetTransactionsDto {
  @IsString()
  @IsOptional()
  page?: number;

  @IsString()
  @IsOptional()
  limit?: number;
}
