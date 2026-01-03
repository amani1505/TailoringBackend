import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { SharedMeasurement } from './shared-measurement.entity';

@Entity('measurements')
export class Measurement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, (user) => user.measurements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  height: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  shoulderWidth: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  chestCircumference: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  waistCircumference: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  hipCircumference: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  sleeveLength: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  upperArmLength: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  neckCircumference: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  inseam: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  torsoLength: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bicepCircumference: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  wristCircumference: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  thighCircumference: number;

  @Column({ type: 'text', nullable: true })
  frontImageUrl: string;

  @Column({ type: 'text', nullable: true })
  sideImageUrl: string;

  @Column({ type: 'json', nullable: true })
  metadata: {
    bodyHeightPixels?: number;
    frontImageSize?: { width: number; height: number };
    sideImageSize?: { width: number; height: number };
  };

  @Column({ type: 'json', nullable: true })
  confidence: {
    frontDetection?: boolean;
    sideDetection?: boolean;
    landmarksDetected?: number;
  };

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  isFavorite: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => SharedMeasurement, (shared) => shared.measurement)
  sharedWith: SharedMeasurement[];
}
