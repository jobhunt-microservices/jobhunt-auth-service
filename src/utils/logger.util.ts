import { config } from '@auth/config';
import { winstonLogger } from '@jobhunt-microservices/jobhunt-shared';
import { Logger } from 'winston';

export const logger = (name: string, level: string) => {
  const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, name, level);
  return log;
};
