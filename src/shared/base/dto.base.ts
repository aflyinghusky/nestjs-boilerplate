import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class getOneDto {
  @ApiProperty()
  @IsUUID()
  @IsString()
  id: string;
}

export class LiteralObject {
  [key: string]: any;
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetManyQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional()
  @IsNumberString()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional()
  @IsNumberString()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @IsEnum(SortDirection)
  @IsOptional()
  sortDirection?: string;
}
