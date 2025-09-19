import { User } from './user.entity';
import { KycStatus } from '../enums/kyc-status.enum';
export declare class KycApplicant {
    id: string;
    userId: string;
    applicantId: string;
    inspectionId: string;
    externalUserId: string;
    levelName: string;
    reviewStatus: KycStatus;
    reviewAnswer: 'GREEN' | 'RED' | null;
    rejectLabels: string[] | null;
    reviewRejectType: 'FINAL' | 'RETRY' | null;
    clientComment: string | null;
    moderationComment: string | null;
    rawData: any;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
