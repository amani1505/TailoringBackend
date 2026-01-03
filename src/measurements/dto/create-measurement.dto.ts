import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  Max,
} from 'class-validator';

export class CreateMeasurementDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(50)
  @Max(300)
  height: number;

  @IsNotEmpty()
  @IsEnum(['male', 'female'])
  gender: 'male' | 'female';

  @IsOptional()
  @IsString()
  notes?: string;
}
