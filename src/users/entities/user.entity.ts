import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Measurement } from '../../measurements/entities/measurement.entity';
import { SharedMeasurement } from '../../measurements/entities/shared-measurement.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ length: 20 })
  phoneNumber: string;

  @Column({ type: 'enum', enum: ['male', 'female'], default: 'male' })
  gender: 'male' | 'female';

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  country: string;

  @Column({ type: 'text', nullable: true })
  profileImage: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Measurement, (measurement) => measurement.user)
  measurements: Measurement[];

  @OneToMany(() => SharedMeasurement, (shared) => shared.user)
  sharedMeasurements: SharedMeasurement[];
}
