import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeasurementController } from './measurement.controller';
import { MeasurementService } from './measurement.service';
import { Measurement } from './entities/measurement.entity';
import { SharedMeasurement } from './entities/shared-measurement.entity';
import { UsersModule } from '../users/users.module';
import { TailorsModule } from '../tailors/tailors.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Measurement, SharedMeasurement]),
    UsersModule,
    TailorsModule,
  ],
  controllers: [MeasurementController],
  providers: [MeasurementService],
  exports: [MeasurementService],
})
export class MeasurementModule {}
