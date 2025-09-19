import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { OtpService } from './otp.service';
import { MailService } from './mail.service';
import { ChangePasswordDto } from 'src/dto/change-password.dto';
export declare class AuthService {
    private userRepository;
    private jwtService;
    private otp;
    private mail;
    private readonly logger;
    constructor(userRepository: Repository<User>, jwtService: JwtService, otp: OtpService, mail: MailService);
    generateSignupToken(sub: string): Promise<string>;
    generateSignupOtp(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyOtp(email: string, otp: string): Promise<{
        success: boolean;
        access_token: string;
    }>;
    register(registerUserDto: RegisterUserDto, token: string): Promise<{
        message: string;
        user: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
            phoneNumber: string;
            emailVerifiedAt: Date | null;
            phoneVerifiedAt: Date | null;
            passwordResetToken: string | null;
            passwordResetExpires: Date | null;
            middleName: string | null;
            dateOfBirth: Date | null;
            gender: "M" | "F" | "X" | null;
            nationality: string | null;
            placeOfBirth: string | null;
            kycStatus: import("../enums/kyc-status.enum").KycStatus;
            kycApplicantId: string | null;
            kycCompletedAt: Date | null;
            verifications: import("../entities/verification.entity").Verification[];
            kycApplicants: import("../entities/kyc-applicant.entity").KycApplicant[];
            kycWebhookEvents: import("../entities/kyc-webhook-event.entity").KycWebhookEvent[];
            wallets: import("../entities/user-wallet.entity").UserWallet[];
            createdAt: Date;
            updatedAt: Date;
        };
        accessToken: string;
    }>;
    login(loginUserDto: LoginUserDto): Promise<{
        message: string;
        user: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
            phoneNumber: string;
            emailVerifiedAt: Date | null;
            phoneVerifiedAt: Date | null;
            passwordResetToken: string | null;
            passwordResetExpires: Date | null;
            middleName: string | null;
            dateOfBirth: Date | null;
            gender: "M" | "F" | "X" | null;
            nationality: string | null;
            placeOfBirth: string | null;
            kycStatus: import("../enums/kyc-status.enum").KycStatus;
            kycApplicantId: string | null;
            kycCompletedAt: Date | null;
            verifications: import("../entities/verification.entity").Verification[];
            kycApplicants: import("../entities/kyc-applicant.entity").KycApplicant[];
            kycWebhookEvents: import("../entities/kyc-webhook-event.entity").KycWebhookEvent[];
            wallets: import("../entities/user-wallet.entity").UserWallet[];
            createdAt: Date;
            updatedAt: Date;
        };
        accessToken: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
        email: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    changePassword(changePasswordDto: ChangePasswordDto, user: User): Promise<{
        message: string;
    }>;
    getProfile(user: User): {
        message: string;
        user: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
            phoneNumber: string;
            emailVerifiedAt: Date | null;
            phoneVerifiedAt: Date | null;
            middleName: string | null;
            dateOfBirth: Date | null;
            gender: "M" | "F" | "X" | null;
            nationality: string | null;
            placeOfBirth: string | null;
            kycStatus: import("../enums/kyc-status.enum").KycStatus;
            kycApplicantId: string | null;
            kycCompletedAt: Date | null;
            verifications: import("../entities/verification.entity").Verification[];
            kycApplicants: import("../entities/kyc-applicant.entity").KycApplicant[];
            kycWebhookEvents: import("../entities/kyc-webhook-event.entity").KycWebhookEvent[];
            wallets: import("../entities/user-wallet.entity").UserWallet[];
            createdAt: Date;
            updatedAt: Date;
        };
    };
    updateProfile(user: User, updateData: Partial<User>): Promise<{
        message: string;
        user: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
            phoneNumber: string;
            emailVerifiedAt: Date | null;
            phoneVerifiedAt: Date | null;
            middleName: string | null;
            dateOfBirth: Date | null;
            gender: "M" | "F" | "X" | null;
            nationality: string | null;
            placeOfBirth: string | null;
            kycStatus: import("../enums/kyc-status.enum").KycStatus;
            kycApplicantId: string | null;
            kycCompletedAt: Date | null;
            verifications: import("../entities/verification.entity").Verification[];
            kycApplicants: import("../entities/kyc-applicant.entity").KycApplicant[];
            kycWebhookEvents: import("../entities/kyc-webhook-event.entity").KycWebhookEvent[];
            wallets: import("../entities/user-wallet.entity").UserWallet[];
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
}
