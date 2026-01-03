import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class ShareMeasurementDto {
  @IsNotEmpty()
  @IsUUID()
  measurementId: string;

  @IsNotEmpty()
  @IsUUID()
  tailorId: string;

  @IsOptional()
  @IsString()
  message?: string;
}
