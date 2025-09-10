import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('kyc_webhook_events')
export class KycWebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_id', unique: true, type: 'varchar' })
  @Index()
  eventId: string;

  @Column({ name: 'event_type', type: 'varchar' })
  eventType: string;

  @Column({ name: 'applicant_id', type: 'varchar' })
  @Index()
  applicantId: string;

  @Column({ name: 'external_user_id', nullable: true, type: 'varchar' })
  externalUserId: string | null;

  @Column({ name: 'payload', type: 'json' })
  payload: any;

  @Column({ name: 'processed', default: false })
  processed: boolean;

  @Column({ name: 'processed_at', nullable: true, type: 'timestamp' })
  processedAt: Date | null;

  @Column({ name: 'error_message', nullable: true, type: 'text' })
  errorMessage: string | null;

  @Column({ name: 'retry_count', default: 0 })
  retryCount: number;

  // Optional relationship to User (if external_user_id matches a user)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'external_user_id' })
  user: User | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
