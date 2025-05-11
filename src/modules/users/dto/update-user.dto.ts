import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString({ message: '旧密码必须为字符串' })
  @IsNotEmpty({ message: '旧密码不能为空' })
  @Length(8, 25, { message: '旧密码长度范围是8-25个字符' })
  oldPassword: string;
}
