import { IsString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class ForgotPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'email is required' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  identifier: string; // Can be username, email, or phone number
}
