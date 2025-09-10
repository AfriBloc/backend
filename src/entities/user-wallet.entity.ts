import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum WalletType {
  HEDERA = 'HEDERA',
}

export enum Currency {
  HBAR = 'HBAR',
  USD = 'USD',
  NGN = 'NGN',
}

export enum NetworkType {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
}

@Entity('user_wallets')
export class UserWallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'wallet_address', type: 'varchar', length: 255 })
  walletAddress: string;

  @Column({ name: 'evm_address', type: 'varchar', length: 255, nullable: true })
  evmAddress: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({
    name: 'wallet_type',
    type: 'enum',
    enum: WalletType,
    default: WalletType.HEDERA,
  })
  walletType: WalletType;

  @Column({
    name: 'network_type',
    type: 'enum',
    enum: NetworkType,
    default: NetworkType.MAINNET,
  })
  networkType: NetworkType;

  @Column({ type: 'varchar', length: 50, nullable: true })
  asset: string;

  @Column({
    name: 'currency',
    type: 'enum',
    enum: Currency,
    default: Currency.HBAR,
  })
  currency: Currency;

  @Column({ name: 'vault_id', type: 'varchar', length: 255 })
  vaultId: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  balance: number;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.wallets)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
