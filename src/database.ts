import { SERVICE_NAME } from '@auth/constants';
import { logger } from '@auth/utils/logger.util';
import { getErrorMessage } from '@jobhunt-microservices/jobhunt-shared';
import { Sequelize } from 'sequelize';
import { config } from './config';

const log = logger('authDatabaseServer', 'debug');

export class Database {
  public sequelize: Sequelize;
  constructor() {
    this.sequelize = new Sequelize(`${config.MYSQL_DB}`, {
      dialect: 'mysql',
      logging: false,
      dialectOptions: {
        multipleStatements: true
      }
    });
  }
  public async connection() {
    try {
      await this.sequelize.authenticate();
      log.info(SERVICE_NAME + ' Mysql database connection has been established successfully');
    } catch (error) {
      log.error(SERVICE_NAME + ' unable to connect to db');
      log.log('error', SERVICE_NAME + ` connection() method:`, getErrorMessage(error));
    }
  }
}

export const database = new Database();
