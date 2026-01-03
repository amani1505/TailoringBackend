import { PartialType } from '@nestjs/mapped-types';
import { CreateTailorDto } from './create-tailor.dto';

export class UpdateTailorDto extends PartialType(CreateTailorDto) {}
