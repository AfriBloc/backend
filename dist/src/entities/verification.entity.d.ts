import { User } from './user.entity';
export declare enum VerificationType {
    EMAIL = "email",
    PHONE = "phone"
}
export declare class Verification {
    id: string;
    userId: string;
    user: User;
    type: VerificationType;
    identifier: string;
    pinId: string;
    isVerified: boolean;
    verifiedAt: Date | null;
    expiresAt: Date;
    attempts: number;
    createdAt: Date;
    updatedAt: Date;
}
