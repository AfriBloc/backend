import { IsNotEmpty, IsNumber, IsPositive, IsUUID } from 'class-validator';

export class PurchasePropertyDto {
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;

  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  units: number;
}
