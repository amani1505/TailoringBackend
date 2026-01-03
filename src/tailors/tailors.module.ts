import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TailorsService } from './tailors.service';
import { TailorsController } from './tailors.controller';
import { Tailor } from './entities/tailor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tailor])],
  controllers: [TailorsController],
  providers: [TailorsService],
  exports: [TailorsService],
})
export class TailorsModule {}
