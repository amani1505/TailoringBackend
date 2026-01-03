import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SharedMeasurement } from '../../measurements/entities/shared-measurement.entity';

@Entity('tailors')
export class Tailor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  businessName: string;

  @Column({ length: 100 })
  ownerName: string;

  @Column({ unique: true })
  email: string;

  @Column({ length: 20 })
  phoneNumber: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  country: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'text', nullable: true })
  profileImage: string;

  @Column({ type: 'simple-array', nullable: true })
  specialties: string[];

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  totalOrders: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => SharedMeasurement, (shared) => shared.tailor)
  receivedMeasurements: SharedMeasurement[];
}
