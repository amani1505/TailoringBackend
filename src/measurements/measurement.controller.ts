import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { MeasurementService } from './measurement.service';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { ShareMeasurementDto } from './dto/share-measurement.dto';

@Controller('measurements')
export class MeasurementController {
  constructor(private readonly measurementService: MeasurementService) {}

  @Post('process')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'frontImage', maxCount: 1 },
      { name: 'sideImage', maxCount: 1 },
    ], {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        // Valid MIME types: image/jpeg, image/png
        // Note: image/jpg is NOT a valid MIME type, use image/jpeg
        // Also accept application/octet-stream if filename has valid image extension
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];

        console.log('📁 File upload attempt:');
        console.log('  - Field:', file.fieldname);
        console.log('  - Original name:', file.originalname);
        console.log('  - MIME type:', file.mimetype);
        console.log('  - Size:', file.size);

        // Check MIME type
        if (allowedMimeTypes.includes(file.mimetype)) {
          console.log('✅ Accepted - Valid MIME type');
          return cb(null, true);
        }

        // Fallback: Check file extension if MIME type is generic
        if (file.mimetype === 'application/octet-stream') {
          const ext = file.originalname.split('.').pop()?.toLowerCase();
          if (ext && ['jpg', 'jpeg', 'png'].includes(ext)) {
            console.log(`✅ Accepted - octet-stream with valid extension: ${ext}`);
            return cb(null, true);
          }
        }

        console.log('❌ Rejected - Invalid MIME type:', file.mimetype);
        return cb(new BadRequestException(`Only JPEG and PNG images allowed. Received: ${file.mimetype}`), false);
      },
    })
  )
  async processMeasurement(
    @UploadedFiles()
    files: {
      frontImage?: Express.Multer.File[];
      sideImage?: Express.Multer.File[];
    },
    @Body() createMeasurementDto: CreateMeasurementDto,
  ) {
    if (!files.frontImage || !files.sideImage) {
      throw new BadRequestException('Both front and side images are required');
    }

    const measurement = await this.measurementService.processAndSaveMeasurements(
      createMeasurementDto,
      files.frontImage[0].buffer,
      files.sideImage[0].buffer,
    );

    return { success: true, data: measurement, message: 'Measurements processed and saved successfully' };
  }

  @Get()
  async findAll() {
    const measurements = await this.measurementService.findAll();
    return { success: true, data: measurements, count: measurements.length };
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    const measurements = await this.measurementService.findByUser(userId);
    return { success: true, data: measurements, count: measurements.length };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const measurement = await this.measurementService.findOne(id);
    return { success: true, data: measurement };
  }

  @Post('share')
  async shareMeasurement(
    @Body() shareMeasurementDto: ShareMeasurementDto,
    @Query('userId') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const shared = await this.measurementService.shareMeasurement(shareMeasurementDto, userId);
    return { success: true, data: shared, message: 'Measurement shared successfully' };
  }

  @Get('shared/user/:userId')
  async getSharedMeasurements(@Param('userId') userId: string) {
    const shared = await this.measurementService.getSharedMeasurements(userId);
    return { success: true, data: shared, count: shared.length };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Query('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    await this.measurementService.remove(id, userId);
    return { success: true, message: 'Measurement deleted successfully' };
  }
}
