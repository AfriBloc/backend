import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { KycStatus } from '../enums/kyc-status.enum';

@Entity('kyc_applicants')
export class KycApplicant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar' })
  @Index()
  userId: string;

  @Column({ name: 'applicant_id', unique: true, type: 'varchar' })
  @Index()
  applicantId: string;

  @Column({ name: 'inspection_id', type: 'varchar' })
  inspectionId: string;

  @Column({ name: 'external_user_id', type: 'varchar' })
  externalUserId: string;

  @Column({ name: 'level_name', type: 'varchar' })
  levelName: string;

  @Column({ name: 'review_status', type: 'enum', enum: KycStatus })
  reviewStatus: KycStatus;

  @Column({ name: 'review_answer', nullable: true, type: 'varchar' })
  reviewAnswer: 'GREEN' | 'RED' | null;

  @Column({ name: 'reject_labels', type: 'json', nullable: true })
  rejectLabels: string[] | null;

  @Column({ name: 'review_reject_type', nullable: true, type: 'varchar' })
  reviewRejectType: 'FINAL' | 'RETRY' | null;

  @Column({ name: 'client_comment', nullable: true, type: 'text' })
  clientComment: string | null;

  @Column({ name: 'moderation_comment', nullable: true, type: 'text' })
  moderationComment: string | null;

  @Column({ name: 'raw_data', type: 'json', nullable: true })
  rawData: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
