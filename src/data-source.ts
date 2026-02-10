import 'dotenv/config';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'admin_panel_db',

  entities: ['dist/modules/**/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],

  synchronize: false,
  logging: false,
});
