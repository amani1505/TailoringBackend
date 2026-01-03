import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  Length,
} from 'class-validator';

export class CreateTailorDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  businessName: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  ownerName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(10, 20)
  phoneNumber: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];
}
