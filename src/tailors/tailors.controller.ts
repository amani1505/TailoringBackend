import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TailorsService } from './tailors.service';
import { CreateTailorDto } from './dto/create-tailor.dto';
import { UpdateTailorDto } from './dto/update-tailor.dto';

@Controller('tailors')
export class TailorsController {
  constructor(private readonly tailorsService: TailorsService) {}

  @Post()
  async create(@Body() createTailorDto: CreateTailorDto) {
    const tailor = await this.tailorsService.create(createTailorDto);
    return { success: true, data: tailor, message: 'Tailor registered successfully' };
  }

  @Get()
  async findAll() {
    const tailors = await this.tailorsService.findAll();
    return { success: true, data: tailors, count: tailors.length };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const tailor = await this.tailorsService.findOne(id);
    return { success: true, data: tailor };
  }

  @Get(':id/measurements')
  async getReceivedMeasurements(@Param('id') id: string) {
    const measurements = await this.tailorsService.getReceivedMeasurements(id);
    return { success: true, data: measurements, count: measurements.length };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTailorDto: UpdateTailorDto) {
    const tailor = await this.tailorsService.update(id, updateTailorDto);
    return { success: true, data: tailor, message: 'Tailor updated successfully' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.tailorsService.remove(id);
    return { success: true, message: 'Tailor deleted successfully' };
  }
}
