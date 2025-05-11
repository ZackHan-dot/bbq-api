import { Controller, Get, Param, Post, Body, Put, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { plainToInstance } from 'class-transformer';
import { QueryUserDto } from './dto/query-user.dto';
import { password_hash } from 'src/util/bcrypt';
import { RoleEnum } from '../roles/roles.enum';
import { Roles } from '../roles/roles.decorator';
import { UpdateUserRolesDto } from '../roles/dto/update-user-roles.dto';
import { UpdateUserDto } from './dto/update-user.dto';
interface RequestWithUser extends Request {
  user: {
    username: string;
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(RoleEnum.ADMIN)
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return plainToInstance(QueryUserDto, users);
  }

  @Get('get/:username')
  findOne(@Param('username') username: string) {
    const user = this.usersService.findOne(username);
    return plainToInstance(QueryUserDto, user);
  }

  @Get('current')
  getProfile(@Req() request: RequestWithUser) {
    const { username } = request.user;
    const user = this.usersService.findOne(username);
    return plainToInstance(QueryUserDto, user);
  }

  @Post('save')
  async create(@Body() createUserDto: CreateUserDto) {
    createUserDto.password = await password_hash(createUserDto.password);
    await this.usersService.create(createUserDto);
    return { message: '创建用户成功' };
  }

  @Put('update/roles')
  async updateUserRoles(@Body() updateUserRolesDto: UpdateUserRolesDto) {
    await this.usersService.updateUserRoles(updateUserRolesDto);
    return { message: '更新用户角色成功' };
  }

  @Put('update')
  async updatePassword(
    @Req() request: RequestWithUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const { username } = request.user;
    updateUserDto.password = await password_hash(updateUserDto.password);
    await this.usersService.updateUserPassword(username, updateUserDto);
    return { message: '更新用户密码成功' };
  }
}
