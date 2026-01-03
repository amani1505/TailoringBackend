import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tailor } from './entities/tailor.entity';
import { CreateTailorDto } from './dto/create-tailor.dto';
import { UpdateTailorDto } from './dto/update-tailor.dto';

@Injectable()
export class TailorsService {
  constructor(
    @InjectRepository(Tailor)
    private tailorsRepository: Repository<Tailor>,
  ) {}

  async create(createTailorDto: CreateTailorDto): Promise<Tailor> {
    const existingTailor = await this.tailorsRepository.findOne({
      where: { email: createTailorDto.email },
    });

    if (existingTailor) {
      throw new ConflictException('Email already exists');
    }

    const tailor = this.tailorsRepository.create(createTailorDto);
    return await this.tailorsRepository.save(tailor);
  }

  async findAll(): Promise<Tailor[]> {
    return await this.tailorsRepository.find({
      where: { isActive: true },
      order: { rating: 'DESC', totalOrders: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Tailor> {
    const tailor = await this.tailorsRepository.findOne({ where: { id } });
    if (!tailor) {
      throw new NotFoundException(`Tailor with ID ${id} not found`);
    }
    return tailor;
  }

  async update(id: string, updateTailorDto: UpdateTailorDto): Promise<Tailor> {
    const tailor = await this.findOne(id);
    Object.assign(tailor, updateTailorDto);
    return await this.tailorsRepository.save(tailor);
  }

  async remove(id: string): Promise<void> {
    const tailor = await this.findOne(id);
    await this.tailorsRepository.remove(tailor);
  }

  async getReceivedMeasurements(tailorId: string) {
    const tailor = await this.tailorsRepository.findOne({
      where: { id: tailorId },
      relations: ['receivedMeasurements', 'receivedMeasurements.measurement', 'receivedMeasurements.user'],
    });

    if (!tailor) {
      throw new NotFoundException(`Tailor with ID ${tailorId} not found`);
    }

    return tailor.receivedMeasurements;
  }
}
