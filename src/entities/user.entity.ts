import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { KycStatus } from '../enums/kyc-status.enum';
import { Verification } from './verification.entity';
import { KycApplicant } from './kyc-applicant.entity';
import { KycWebhookEvent } from './kyc-webhook-event.entity';
import { UserWallet } from './user-wallet.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name', nullable: true, type: 'varchar', length: 100 })
  firstName: string | null;

  @Column({ name: 'last_name', nullable: true, type: 'varchar', length: 100 })
  lastName: string | null;

  @Column({ unique: true, length: 255, type: 'varchar' })
  @Index()
  email: string;

  @Column({ name: 'phone_number', nullable: true, unique: true, length: 20 })
  @Index()
  phoneNumber: string;

  @Column({ length: 255 })
  password: string;

  @Column({ name: 'email_verified_at', nullable: true, type: 'timestamp' })
  emailVerifiedAt: Date | null;

  @Column({ name: 'phone_verified_at', nullable: true, type: 'timestamp' })
  phoneVerifiedAt: Date | null;

  @Column({
    name: 'password_reset_token',
    nullable: true,
    length: 255,
    type: 'varchar',
  })
  passwordResetToken: string | null;

  @Column({ name: 'password_reset_expires', nullable: true, type: 'timestamp' })
  passwordResetExpires: Date | null;

  @Column({ name: 'middle_name', nullable: true, type: 'varchar', length: 100 })
  middleName: string | null;

  @Column({ name: 'date_of_birth', nullable: true, type: 'date' })
  dateOfBirth: Date | null;

  @Column({ name: 'gender', nullable: true, type: 'varchar', length: 1 })
  gender: 'M' | 'F' | 'X' | null;

  @Column({ name: 'nationality', nullable: true, type: 'varchar', length: 3 })
  nationality: string | null; // Alpha-3 country code

  @Column({
    name: 'place_of_birth',
    nullable: true,
    type: 'varchar',
    length: 255,
  })
  placeOfBirth: string | null;

  @Column({
    name: 'kyc_status',
    type: 'enum',
    enum: KycStatus,
    default: KycStatus.PENDING,
  })
  kycStatus: KycStatus;

  @Column({ name: 'kyc_applicant_id', nullable: true, type: 'varchar' })
  kycApplicantId: string | null;

  @Column({ name: 'kyc_completed_at', nullable: true, type: 'timestamp' })
  kycCompletedAt: Date | null;

  // Relationships
  @OneToMany(() => Verification, (verification) => verification.user)
  verifications: Verification[];

  @OneToMany(() => KycApplicant, (kycApplicant) => kycApplicant.user)
  kycApplicants: KycApplicant[];

  @OneToMany(() => KycWebhookEvent, (event) => event.user)
  kycWebhookEvents: KycWebhookEvent[];

  @OneToMany(() => UserWallet, (wallet) => wallet.user)
  wallets: UserWallet[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
