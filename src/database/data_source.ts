import { ConfigService } from '@nestjs/config';
import config from '../configs';
import { entities } from './entities';
import { DataSource, DataSourceOptions } from 'typeorm';

const configService = new ConfigService(config());

const options = {
  type: configService.get('database.type'),
  host: configService.get('database.host'),
  port: configService.get('database.port'),
  username: configService.get('database.username'),
  password: configService.get('database.password'),
  database: configService.get('database.database'),
  synchronize: configService.get('app.nodeEnv') === 'local',
  dropSchema: false,
  logging: configService.get('app.nodeEnv') !== 'production',
  entities: entities,
  migrations: [__dirname + '/migrations/**/*{.ts, .js}'],
  seeds: [__dirname + '/seeds/**/*.seed{.ts, .js}'],
} as DataSourceOptions;

export const dataSource = new DataSource(options);

export default options;
