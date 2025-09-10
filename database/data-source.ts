import { DataSource } from 'typeorm';
import { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

export const env = process.env;
export const config = {
  type: 'postgres',
  host: env.DATABASE_HOST ?? '127.0.0.1',
  url: env.DATABASE_URL,
  port: env.DATABASE_PORT ? parseInt(env.DATABASE_PORT, 10) : 5432,
  synchronize: env.APP_ENV === 'development',
  logging: env.APP_ENV === 'development' ? 'all' : ['error'],
  username: env.DATABASE_USERNAME ?? '',
  password: env.DATABASE_PASSWORD ?? '',
  database: env.DATABASE_NAME,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/database/migrations/*{.ts,.js}'],
  sslmode: 'require',
};
export const dataSource = new DataSource(config as DataSourceOptions);
