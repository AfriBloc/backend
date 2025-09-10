import { IsString, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Email is required' })
  identifier: string; // Can be username, email, or phone number

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
