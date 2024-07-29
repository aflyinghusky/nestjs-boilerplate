import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { DeepPartial } from 'typeorm';

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

export enum SortBy {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  ID = 'id',
  CREATOR_ID = 'creator_id',
}

export class GetManyQueryDto<T> {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sort_by?: keyof DeepPartial<T>;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional()
  @IsEnum(SortDirection)
  @IsOptional()
  sort_direction?: SortDirection;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  cursor?: string;
}
