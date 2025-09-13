import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Property } from './property.entity';
import { Currency } from './user-wallet.entity';

@Entity('property_portfolio_items')
@Unique('uq_user_property', ['userId', 'propertyId'])
export class PortfolioItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar' })
  @Index()
  userId: string;

  @Column({ name: 'property_id', type: 'varchar' })
  @Index()
  propertyId: string;

  @Column({
    name: 'currency',
    type: 'enum',
    enum: Currency,
    default: Currency.NGN,
  })
  currency: Currency;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Property, (property) => property.portfolioItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({
    name: 'total_invested',
    type: 'numeric',
    precision: 20,
    scale: 8,
    nullable: true,
  })
  totalInvested: string;

  @Column({
    name: 'yield',
    type: 'numeric',
    precision: 20,
    scale: 8,
    nullable: true,
  })
  yield: string;

  @Column({ name: 'units_owned', type: 'int', default: 0 })
  unitsOwned: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
