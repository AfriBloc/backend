/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Or } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../entities/user.entity';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { OtpService } from './otp.service';
import { MailService } from './mail.service';
import { ChangePasswordDto } from 'src/dto/change-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private otp: OtpService,
    private mail: MailService,
  ) {}

  async generateSignupToken(sub: string) {
    return await this.jwtService.signAsync(
      {
        sub: sub,
        purpose: 'signup',
      },
      {
        expiresIn: '5m',
      },
    );
  }

  async generateSignupOtp(email: string) {
    const userEmail = email.toLowerCase();
    if (await this.userRepository.findOneBy({ email: userEmail })) {
      throw new BadRequestException('A user with this email already exists');
    }
    const code = await this.otp.getOtpByUserIdentifier(userEmail);
    if (code) {
      await this.otp.invalidate(code, userEmail);
    }
    this.mail.sendUserOtp(userEmail, await this.otp.generateFor(userEmail));

    return { success: true, message: 'OTP has been sent to your email' };
  }

  async verifyOtp(email: string, otp: string) {
    const userEmail = email.toLowerCase();
    const isValid = await this.otp.verify(otp, userEmail);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }
    this.otp.invalidate(otp, userEmail).catch((error) => {
      this.logger.error(error);
    });
    return {
      success: true,
      access_token: await this.generateSignupToken(userEmail),
    };
  }

  async register(registerUserDto: RegisterUserDto, token: string) {
    const { firstName, lastName, email, password, confirmPassword } =
      registerUserDto;

    if (!token) {
      throw new UnauthorizedException('Missing or invalid token');
    }

    const data = this.jwtService.verify(token.replace('Bearer ', ''));

    if (data?.purpose !== 'signup' || data?.sub !== registerUserDto.email) {
      throw new UnauthorizedException('Invalid token');
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check if user already exists
    const whereConditions: any[] = [{ email }];

    const existingUser = await this.userRepository.findOne({
      where: whereConditions,
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = this.userRepository.create({
      firstName,
      lastName,
      email: email,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate JWT token
    const payload = {
      sub: savedUser.id,
      fullName: `${savedUser.firstName} ${savedUser.lastName}`,
    };
    const accessToken = this.jwtService.sign(payload);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = savedUser;

    this.mail.sendUserWelcome(user);

    return {
      message: 'User registered successfully',
      user: userWithoutPassword,
      accessToken,
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const { identifier, password } = loginUserDto;

    // Find user by username, email, or phone number
    const user = await this.userRepository.findOne({
      where: [{ email: identifier }],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      fullName: `${user.firstName} ${user.lastName}`,
    };
    const accessToken = this.jwtService.sign(payload);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      message: 'Login successful',
      user: userWithoutPassword,
      accessToken,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { identifier } = forgotPasswordDto;

    // Find user by username, email, or phone number
    const user = await this.userRepository.findOne({
      where: [{ email: identifier }],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Ensure user has an email address
    if (!user.email) {
      throw new BadRequestException(
        'Password reset via email requires a valid email address. Please contact support.',
      );
    }

    // Send OTP via Termii email service
    try {
      // const result = await this.termiiService.sendEmailOTP(user.email, {
      //   codeLength: 6,
      //   ttlMinutes: 10, // 10 minutes for password reset
      //   maxAttempts: 3,
      // });

      // Store password reset request metadata
      // const resetExpires = result.expiresAt;
      user.passwordResetToken = user.email; // Store email as identifier
      // user.passwordResetExpires = resetExpires;
      await this.userRepository.save(user);

      return {
        message: 'Password reset code sent to your email address',
        email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Masked email
        // expiresAt: resetExpires,
      };
    } catch (error) {
      throw new BadRequestException(
        'Failed to send password reset code. Please try again.',
        error.message,
      );
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, code, newPassword, confirmPassword } = resetPasswordDto;

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Find user by email and ensure they have an active reset request
    const user = await this.userRepository.findOne({
      where: {
        email: email,
        passwordResetToken: email, // We store email as the reset token
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid password reset request');
    }

    // Check if reset request is expired
    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      // Clear expired reset request
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await this.userRepository.save(user);
      throw new UnauthorizedException(
        'Password reset request has expired. Please request a new one.',
      );
    }

    // Verify the OTP code using Termii service
    try {
      // const verificationResult = await this.termiiService.verifyEmailOTP(
      //   email,
      //   code,
      // );
      // if (!verificationResult.verified) {
      //   const errorMessage =
      //     verificationResult.reason || 'Invalid verification code';
      //   const attemptsInfo = verificationResult.attemptsLeft
      //     ? ` (${verificationResult.attemptsLeft} attempts remaining)`
      //     : '';
      //   throw new UnauthorizedException(`${errorMessage}${attemptsInfo}`);
      // }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Failed to verify code. Please try again.');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password and clear reset request
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.userRepository.save(user);

    return {
      message: 'Password reset successfully',
    };
  }

  async changePassword(changePasswordDto: ChangePasswordDto, user: User) {
    const { newPassword, oldPassword } = changePasswordDto;

    // Find user by id
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

    // Check if passwords match
    if (!isOldPasswordValid) {
      throw new BadRequestException('Old password is incorrect');
    }

    // Check if new password is different from old password
    if (oldPassword === newPassword) {
      throw new BadRequestException(
        'New password must be different from old password',
      );
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password and clear reset request
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.userRepository.save(user);

    return {
      message: 'Password reset successfully',
    };
  }

  getProfile(user: User) {
    const { password, passwordResetToken, passwordResetExpires, ...profile } =
      user;
    return {
      message: 'Profile retrieved successfully',
      user: profile,
    };
  }

  async updateProfile(user: User, updateData: Partial<User>) {
    // Remove sensitive fields that shouldn't be updated directly
    const {
      password,
      passwordResetToken,
      passwordResetExpires,
      id,
      createdAt,
      updatedAt,
      ...allowedUpdates
    } = updateData;

    // Update user
    await this.userRepository.update(user.id, allowedUpdates);

    // Fetch updated user
    const updatedUser = await this.userRepository.findOne({
      where: { id: user.id },
    });

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    const {
      password: _,
      passwordResetToken: __,
      passwordResetExpires: ___,
      ...userWithoutSensitiveData
    } = updatedUser;

    return {
      message: 'Profile updated successfully',
      user: userWithoutSensitiveData,
    };
  }
}
