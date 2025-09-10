import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Request,
  ValidationPipe,
  Headers,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { User } from '../entities/user.entity';
import { VerifyOtpDto } from 'src/dto/verify-otp.dto';
import { GetOtpDto } from 'src/dto/get-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body(new ValidationPipe({ transform: true }))
    registerUserDto: RegisterUserDto,
    @Headers('authorization') token: string,
  ) {
    return this.authService.register(registerUserDto, token);
  }

  @Post('login')
  async login(
    @Body(new ValidationPipe({ transform: true })) loginUserDto: LoginUserDto,
  ) {
    return this.authService.login(loginUserDto);
  }

  @Post('generate-otp')
  getOtp(@Body() dto: GetOtpDto) {
    return this.authService.generateSignupOtp(dto.email);
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.email, dto.otp);
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body(new ValidationPipe({ transform: true }))
    forgotPasswordDto: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  async resetPassword(
    @Body(new ValidationPipe({ transform: true }))
    resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('profile')
  getProfile(@Request() req: { user: User }) {
    return this.authService.getProfile(req.user);
  }

  @Put('profile')
  async updateProfile(
    @Request() req: { user: User },
    @Body() updateData: Partial<User>,
  ) {
    return this.authService.updateProfile(req.user, updateData);
  }
}
