import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Firstname must be at least 2 characters long' })
  @MaxLength(50, { message: 'Firstname must not exceed 50 characters' })
  @Matches(/^[a-zA-Z]+$/, {
    message: 'Firstname must contain only letters and no spaces',
  })
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Lastname must be at least 3 characters long' })
  @MaxLength(20, { message: 'Lastname must not exceed 20 characters' })
  @Matches(/^[a-zA-Z]+$/, {
    message: 'Lastname must contain only letters and no spaces',
  })
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
