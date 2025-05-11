import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { In, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from 'src/modules/roles/entities/role.entity';
import { RoleEnum } from 'src/modules/roles/roles.enum';
import { UpdateUserRolesDto } from '../roles/dto/update-user-roles.dto';
import { QueryRoleDto } from '../roles/dto/query-role.dto';
import { plainToInstance, instanceToPlain } from 'class-transformer';
import { UpdateUserDto } from './dto/update-user.dto';
import { comparePassword } from 'src/util/bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}
  async findAll(): Promise<User[]> {
    const users = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .getMany();
    // 将角色对象按照DTO对象格式化
    users.forEach((user) => {
      if (user.roles) {
        const roleDto = plainToInstance(QueryRoleDto, user.roles);
        user.roles = instanceToPlain(roleDto) as Role[];
      }
    });
    return users;
  }
  async findOne(username: string): Promise<User | null> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .where('user.username = :username', { username })
      .getOne();
    if (user.roles) {
      const roleDto = plainToInstance(QueryRoleDto, user.roles);
      user.roles = instanceToPlain(roleDto) as Role[];
    }
    return user;
  }
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, password, email } = createUserDto;
    const roles = createUserDto.roles ?? [RoleEnum.USER];

    const rolesNames = roles.map((role) => role.toString());
    const existingRoles = await this.rolesRepository.find({
      where: { roleName: In(rolesNames) },
    });

    const user = this.usersRepository.create({
      username,
      email,
      password,
      roles: existingRoles,
    });

    return await this.usersRepository.save(user);
  }
  findOneByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username },
      relations: ['roles'],
    });
  }

  async updateUserRoles(UpdateUserRolesDto: UpdateUserRolesDto): Promise<User> {
    const { username, roleIds } = UpdateUserRolesDto;
    const user = await this.usersRepository.findOneBy({ username });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const roles = await this.rolesRepository.findBy({ id: In(roleIds) });
    if (roles.length !== roleIds.length) {
      throw new NotFoundException('One or more roles not found');
    }
    user.roles = roles;
    return await this.usersRepository.save(user);
  }

  async updateUserPassword(
    username: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.usersRepository.findOneBy({ username });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!(await comparePassword(updateUserDto.oldPassword, user.password))) {
      throw new BadRequestException('Old password is incorrect');
    }
    if (!updateUserDto.password) {
      throw new BadRequestException('Password is required');
    }
    user.password = updateUserDto.password;
    return await this.usersRepository.save(user);
  }
}
