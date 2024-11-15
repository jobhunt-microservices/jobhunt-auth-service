import { config } from '@auth/config';
import { SERVICE_NAME } from '@auth/constants';
import { logger } from '@auth/utils/logger.util';
import { getErrorMessage } from '@jobhunt-microservices/jobhunt-shared';
import client, { Channel, Connection } from 'amqplib';

const log = logger('authQueueConnection', 'debug');

export const createConnection = async (): Promise<Channel | undefined> => {
  try {
    const connection: Connection = await client.connect(`${config.RABBITMQ_ENDPOINT}`);
    const channel: Channel = await connection.createChannel();
    log.info(SERVICE_NAME + ` connected to queue successfully`);
    closeConnection(channel, connection);
    return channel;
  } catch (error) {
    log.log('error', SERVICE_NAME + ' createConnection() method:', getErrorMessage(error));
    return undefined;
  }
};

export const closeConnection = async (channel: Channel, connection: Connection) => {
  process.once('SIGNINT', async () => {
    await channel.close();
    await connection.close();
  });
};
