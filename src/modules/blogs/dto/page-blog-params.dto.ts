import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class PageBlogParamsDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @Transform(({ value }) => Number(value) || 1)
  currentPage: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @Transform(({ value }) => Number(value) || 10)
  limit: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsOptional()
  @IsString()
  title?: string;
}