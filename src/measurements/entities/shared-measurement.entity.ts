import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Measurement } from './measurement.entity';
import { Tailor } from '../../tailors/entities/tailor.entity';

export enum SharedStatus {
  PENDING = 'pending',
  VIEWED = 'viewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('shared_measurements')
export class SharedMeasurement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  measurementId: string;

  @Column('uuid')
  tailorId: string;

  @ManyToOne(() => User, (user) => user.sharedMeasurements, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Measurement, (measurement) => measurement.sharedWith, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'measurementId' })
  measurement: Measurement;

  @ManyToOne(() => Tailor, (tailor) => tailor.receivedMeasurements, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tailorId' })
  tailor: Tailor;

  @Column({
    type: 'enum',
    enum: SharedStatus,
    default: SharedStatus.PENDING,
  })
  status: SharedStatus;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'text', nullable: true })
  tailorNotes: string;

  @Column({ type: 'timestamp', nullable: true })
  viewedAt: Date;

  @CreateDateColumn()
  sharedAt: Date;
}
