"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../entities/user.entity");
const otp_service_1 = require("./otp.service");
const mail_service_1 = require("./mail.service");
let AuthService = AuthService_1 = class AuthService {
    userRepository;
    jwtService;
    otp;
    mail;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(userRepository, jwtService, otp, mail) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.otp = otp;
        this.mail = mail;
    }
    async generateSignupToken(sub) {
        return await this.jwtService.signAsync({
            sub: sub,
            purpose: 'signup',
        }, {
            expiresIn: '5m',
        });
    }
    async generateSignupOtp(email) {
        const userEmail = email.toLowerCase();
        if (await this.userRepository.findOneBy({ email: userEmail })) {
            throw new common_1.BadRequestException('A user with this email already exists');
        }
        const code = await this.otp.getOtpByUserIdentifier(userEmail);
        if (code) {
            await this.otp.invalidate(code, userEmail);
        }
        this.mail.sendUserOtp(userEmail, await this.otp.generateFor(userEmail));
        return { success: true, message: 'OTP has been sent to your email' };
    }
    async verifyOtp(email, otp) {
        const userEmail = email.toLowerCase();
        const isValid = await this.otp.verify(otp, userEmail);
        if (!isValid) {
            throw new common_1.BadRequestException('Invalid or expired OTP');
        }
        this.otp.invalidate(otp, userEmail).catch((error) => {
            this.logger.error(error);
        });
        return {
            success: true,
            access_token: await this.generateSignupToken(userEmail),
        };
    }
    async register(registerUserDto, token) {
        const { firstName, lastName, email, password, confirmPassword } = registerUserDto;
        if (!token) {
            throw new common_1.UnauthorizedException('Missing or invalid token');
        }
        const data = this.jwtService.verify(token.replace('Bearer ', ''));
        if (data?.purpose !== 'signup' || data?.sub !== registerUserDto.email) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
        if (password !== confirmPassword) {
            throw new common_1.BadRequestException('Passwords do not match');
        }
        const whereConditions = [{ email }];
        const existingUser = await this.userRepository.findOne({
            where: whereConditions,
        });
        if (existingUser) {
            if (existingUser.email === email) {
                throw new common_1.ConflictException('Email already exists');
            }
        }
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = this.userRepository.create({
            firstName,
            lastName,
            email: email,
            password: hashedPassword,
        });
        const savedUser = await this.userRepository.save(user);
        const payload = {
            sub: savedUser.id,
            fullName: `${savedUser.firstName} ${savedUser.lastName}`,
        };
        const accessToken = this.jwtService.sign(payload);
        const { password: _, ...userWithoutPassword } = savedUser;
        this.mail.sendUserWelcome(user);
        return {
            message: 'User registered successfully',
            user: userWithoutPassword,
            accessToken,
        };
    }
    async login(loginUserDto) {
        const { identifier, password } = loginUserDto;
        const user = await this.userRepository.findOne({
            where: [{ email: identifier }],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = {
            sub: user.id,
            fullName: `${user.firstName} ${user.lastName}`,
        };
        const accessToken = this.jwtService.sign(payload);
        const { password: _, ...userWithoutPassword } = user;
        return {
            message: 'Login successful',
            user: userWithoutPassword,
            accessToken,
        };
    }
    async forgotPassword(forgotPasswordDto) {
        const { identifier } = forgotPasswordDto;
        const user = await this.userRepository.findOne({
            where: [{ email: identifier }],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.email) {
            throw new common_1.BadRequestException('Password reset via email requires a valid email address. Please contact support.');
        }
        try {
            user.passwordResetToken = user.email;
            await this.userRepository.save(user);
            return {
                message: 'Password reset code sent to your email address',
                email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to send password reset code. Please try again.', error.message);
        }
    }
    async resetPassword(resetPasswordDto) {
        const { email, code, newPassword, confirmPassword } = resetPasswordDto;
        if (newPassword !== confirmPassword) {
            throw new common_1.BadRequestException('Passwords do not match');
        }
        const user = await this.userRepository.findOne({
            where: {
                email: email,
                passwordResetToken: email,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid password reset request');
        }
        if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
            user.passwordResetToken = null;
            user.passwordResetExpires = null;
            await this.userRepository.save(user);
            throw new common_1.UnauthorizedException('Password reset request has expired. Please request a new one.');
        }
        try {
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to verify code. Please try again.');
        }
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashedPassword;
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await this.userRepository.save(user);
        return {
            message: 'Password reset successfully',
        };
    }
    async changePassword(changePasswordDto, user) {
        const { newPassword, oldPassword } = changePasswordDto;
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
            throw new common_1.BadRequestException('Old password is incorrect');
        }
        if (oldPassword === newPassword) {
            throw new common_1.BadRequestException('New password must be different from old password');
        }
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashedPassword;
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await this.userRepository.save(user);
        return {
            message: 'Password reset successfully',
        };
    }
    getProfile(user) {
        const { password, passwordResetToken, passwordResetExpires, ...profile } = user;
        return {
            message: 'Profile retrieved successfully',
            user: profile,
        };
    }
    async updateProfile(user, updateData) {
        const { password, passwordResetToken, passwordResetExpires, id, createdAt, updatedAt, ...allowedUpdates } = updateData;
        await this.userRepository.update(user.id, allowedUpdates);
        const updatedUser = await this.userRepository.findOne({
            where: { id: user.id },
        });
        if (!updatedUser) {
            throw new common_1.NotFoundException('User not found');
        }
        const { password: _, passwordResetToken: __, passwordResetExpires: ___, ...userWithoutSensitiveData } = updatedUser;
        return {
            message: 'Profile updated successfully',
            user: userWithoutSensitiveData,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        otp_service_1.OtpService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map