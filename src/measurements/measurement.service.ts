import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Measurement } from './entities/measurement.entity';
import { SharedMeasurement, SharedStatus } from './entities/shared-measurement.entity';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { ShareMeasurementDto } from './dto/share-measurement.dto';
import { UsersService } from '../users/users.service';
import { TailorsService } from '../tailors/tailors.service';

const execAsync = promisify(exec);

@Injectable()
export class MeasurementService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private readonly pythonScript = path.join(process.cwd(), 'scripts', 'body_measurement.py');
  // Auto-detect Python path for different environments:
  // 1. Use PYTHON_PATH env var if set
  // 2. Docker production: /opt/venv/bin/python3 (from Dockerfile)
  // 3. Docker legacy: /app/venv/bin/python3
  // 4. Local development: ./venv/bin/python3
  private readonly pythonPath = this.resolvePythonPath();

  private resolvePythonPath(): string {
    // Use environment variable if explicitly set
    if (process.env.PYTHON_PATH && process.env.PYTHON_PATH.trim()) {
      return process.env.PYTHON_PATH.trim();
    }

    // Check common paths in order of preference
    const possiblePaths = [
      '/opt/venv/bin/python3',  // Docker production (from your Dockerfile)
      '/app/venv/bin/python3',  // Docker legacy
      path.join(process.cwd(), 'venv', 'bin', 'python3'),  // Local development
    ];

    // Try to find the first existing path
    const fs = require('fs');
    for (const pythonPath of possiblePaths) {
      try {
        if (fs.existsSync(pythonPath)) {
          return pythonPath;
        }
      } catch (error) {
        // Continue to next path
      }
    }

    // Fallback to system python3 if no venv found
    return 'python3';
  }

  constructor(
    @InjectRepository(Measurement)
    private measurementRepository: Repository<Measurement>,
    @InjectRepository(SharedMeasurement)
    private sharedMeasurementRepository: Repository<SharedMeasurement>,
    private usersService: UsersService,
    private tailorsService: TailorsService,
  ) {
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async processAndSaveMeasurements(
    createMeasurementDto: CreateMeasurementDto,
    frontImageBuffer: Buffer,
    sideImageBuffer: Buffer,
  ): Promise<Measurement> {
    await this.usersService.findOne(createMeasurementDto.userId);

    const timestamp = Date.now();
    const frontPath = path.join(this.uploadDir, `front_${timestamp}.jpg`);
    const sidePath = path.join(this.uploadDir, `side_${timestamp}.jpg`);

    try {
      await fs.writeFile(frontPath, frontImageBuffer);
      await fs.writeFile(sidePath, sideImageBuffer);

      const command = `"${this.pythonPath}" "${this.pythonScript}" "${frontPath}" "${sidePath}" ${createMeasurementDto.height} ${createMeasurementDto.gender}`;
      const { stdout, stderr } = await execAsync(command, { timeout: 30000 });

      if (stderr && !stderr.includes('WARNING')) {
        console.warn('Python stderr:', stderr);
      }

      const result = JSON.parse(stdout);

      if (!result.success) {
        throw new BadRequestException(result.error || 'Measurement processing failed');
      }

      const measurement = this.measurementRepository.create({
        userId: createMeasurementDto.userId,
        height: createMeasurementDto.height,
        shoulderWidth: result.measurements.shoulder_width,
        chestCircumference: result.measurements.chest_circumference,
        waistCircumference: result.measurements.waist_circumference,
        hipCircumference: result.measurements.hip_circumference,
        sleeveLength: result.measurements.sleeve_length,
        upperArmLength: result.measurements.upper_arm_length,
        neckCircumference: result.measurements.neck_circumference,
        inseam: result.measurements.inseam,
        torsoLength: result.measurements.torso_length,
        bicepCircumference: result.measurements.bicep_circumference,
        wristCircumference: result.measurements.wrist_circumference,
        thighCircumference: result.measurements.thigh_circumference,
        frontImageUrl: `uploads/front_${timestamp}.jpg`,
        sideImageUrl: `uploads/side_${timestamp}.jpg`,
        metadata: result.metadata,
        confidence: result.confidence,
        notes: createMeasurementDto.notes,
      });

      return await this.measurementRepository.save(measurement);

    } catch (error) {
      await this.cleanupFiles(frontPath, sidePath);

      if (error instanceof BadRequestException) {
        throw error;
      }

      console.error('Measurement processing error:', error);
      throw new InternalServerErrorException(`Measurement processing failed: ${error.message}`);
    }
  }

  async findAll(): Promise<Measurement[]> {
    return await this.measurementRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<Measurement[]> {
    await this.usersService.findOne(userId);
    
    return await this.measurementRepository.find({
      where: { userId },
      relations: ['user', 'sharedWith', 'sharedWith.tailor'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Measurement> {
    const measurement = await this.measurementRepository.findOne({
      where: { id },
      relations: ['user', 'sharedWith', 'sharedWith.tailor'],
    });

    if (!measurement) {
      throw new NotFoundException(`Measurement with ID ${id} not found`);
    }

    return measurement;
  }

  async shareMeasurement(shareMeasurementDto: ShareMeasurementDto, userId: string): Promise<SharedMeasurement> {
    const measurement = await this.findOne(shareMeasurementDto.measurementId);
    
    if (measurement.userId !== userId) {
      throw new BadRequestException('You can only share your own measurements');
    }

    await this.tailorsService.findOne(shareMeasurementDto.tailorId);

    const existingShare = await this.sharedMeasurementRepository.findOne({
      where: {
        measurementId: shareMeasurementDto.measurementId,
        tailorId: shareMeasurementDto.tailorId,
      },
    });

    if (existingShare) {
      throw new BadRequestException('Measurement already shared with this tailor');
    }

    const sharedMeasurement = this.sharedMeasurementRepository.create({
      userId,
      measurementId: shareMeasurementDto.measurementId,
      tailorId: shareMeasurementDto.tailorId,
      message: shareMeasurementDto.message,
      status: SharedStatus.PENDING,
    });

    return await this.sharedMeasurementRepository.save(sharedMeasurement);
  }

  async getSharedMeasurements(userId: string): Promise<SharedMeasurement[]> {
    return await this.sharedMeasurementRepository.find({
      where: { userId },
      relations: ['measurement', 'tailor', 'user'],
      order: { sharedAt: 'DESC' },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const measurement = await this.findOne(id);
    
    if (measurement.userId !== userId) {
      throw new BadRequestException('You can only delete your own measurements');
    }

    await this.measurementRepository.remove(measurement);
    
    if (measurement.frontImageUrl) {
      await this.cleanupFiles(path.join(process.cwd(), measurement.frontImageUrl));
    }
    if (measurement.sideImageUrl) {
      await this.cleanupFiles(path.join(process.cwd(), measurement.sideImageUrl));
    }
  }

  private async cleanupFiles(...paths: string[]) {
    for (const filePath of paths) {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.warn(`Failed to delete file ${filePath}:`, error.message);
      }
    }
  }
}
