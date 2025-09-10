import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
// import { Property } from './property.entity';

@Entity('sub_property')
export class SubProperty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'property_id', type: 'varchar' })
  @Index()
  propertyId: string;

  // @ManyToOne(() => Property, (property) => property.subProperty, {
  //   onDelete: 'CASCADE',
  // })
  // @JoinColumn({ name: 'property_id' })
  // property: Property;

  @Column({ type: 'varchar', length: 255 })
  name: string; // e.g., "3 Bedroom Middle Unit"

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
