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
import { Currency, NetworkType, WalletType } from './user-wallet.entity';

export enum TransactionType {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar' })
  @Index()
  userId: string;

  @Column({ name: 'wallet_type', type: 'enum', enum: WalletType })
  walletType: WalletType;

  @Column({ name: 'transaction_type', type: 'enum', enum: TransactionType })
  transactionType: TransactionType;

  @Column({
    name: 'status',
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  @Index()
  status: TransactionStatus;

  @Column({ name: 'amount', type: 'numeric', precision: 20, scale: 8 })
  amount: string; // Amount in satoshis for BTC, micro USDT for USDT

  @Column({
    name: 'fees',
    type: 'numeric',
    precision: 20,
    scale: 8,
    default: 0,
  })
  fees: string; // Fees in satoshis for BTC, micro USDT for USDT

  @Column({ name: 'currency', type: 'enum', enum: Currency })
  currency: Currency;

  @Column({ name: 'reference', type: 'varchar', unique: true })
  @Index()
  reference: string; // Our internal reference

  @Column({ name: 'fireblock_transaction_id', nullable: true, type: 'varchar' })
  @Index()
  fireblockTransactionId: string | null; // Fireblocks' transaction ID

  @Column({ name: 'description', nullable: true, type: 'text' })
  description: string | null;

  @Column({ name: 'hash', nullable: true, type: 'varchar' })
  hash: string | null; // Blockchain transaction hash

  @Column({ name: 'address', nullable: true, type: 'varchar' })
  address: string | null; // Destination address for sends, source for receives

  @Column({ name: 'network', type: 'enum', enum: NetworkType })
  network: NetworkType;

  @Column({
    name: 'spot_price',
    nullable: true,
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  spotPrice: number | null; // USD spot price at time of transaction

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
