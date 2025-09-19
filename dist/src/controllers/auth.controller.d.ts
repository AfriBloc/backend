import { AuthService } from '../services/auth.service';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { User } from '../entities/user.entity';
import { VerifyOtpDto } from 'src/dto/verify-otp.dto';
import { GetOtpDto } from 'src/dto/get-otp.dto';
import { ChangePasswordDto } from 'src/dto/change-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getOtp(dto: GetOtpDto): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
        success: boolean;
        access_token: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
        email: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    changePassword(req: {
        user: User;
    }, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getProfile(req: {
        user: User;
    }): {
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
    updateProfile(req: {
        user: User;
    }, updateData: Partial<User>): Promise<{
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
