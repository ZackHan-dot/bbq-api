import { RedisSingleOptions } from '@nestjs-modules/ioredis';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({
  path: path.resolve(
    __dirname,
    `../${process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env.local'}`,
  ),
});
export const GLOBAL_API_PREFIX = 'api';
export const APP_DEFAULT_PORT = 3000;

export const TypeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  autoLoadEntities: true,
  synchronize: false,
  logging: true,
  logger: 'advanced-console',
};

export const RedisConfig: RedisSingleOptions = {
  type: 'single',
  url: 'redis://localhost:6379/1',
};

export const AppConfig = {
  envFilePath: process.env.NODE_ENV
    ? `.env.${process.env.NODE_ENV}`
    : '.env.local',
  isGlobal: true,
};
