import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  IsDateString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(10, 20)
  phoneNumber: string;

  @IsNotEmpty()
  @IsEnum(['male', 'female'])
  gender: 'male' | 'female';

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(300)
  height?: number;

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(500)
  weight?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;
}
