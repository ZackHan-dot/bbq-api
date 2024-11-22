import { IsOptional, IsString } from 'class-validator';

export class QueryTagDto {
  @IsOptional()
  @IsString({ message: '标签名必须是字符串' })
  name: string;

  @IsOptional()
  @IsString({ message: '标签类型必须是数字' })
  tagTypeId: number;
}
