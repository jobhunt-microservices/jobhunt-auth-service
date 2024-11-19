import { SERVICE_NAME } from '@auth/constants';
import { createConnection } from '@auth/queues/connections';
import { logger } from '@auth/utils/logger.util';
import { getErrorMessage } from '@jobhunt-microservices/jobhunt-shared';
import { Channel } from 'amqplib';

const log = logger('authProducerConsumer', 'debug');

class AuthProducer {
  public publishDirectMessage = async (
    channel: Channel,
    exchangeName: string,
    routingKey: string,
    message: string,
    logMessage: string
  ): Promise<void> => {
    try {
      if (!channel) {
        channel = (await createConnection()) as Channel;
      }
      await channel.assertExchange(exchangeName, 'direct');
      channel.publish(exchangeName, routingKey, Buffer.from(message));
      log.info(logMessage);
    } catch (error) {
      log.log('error', SERVICE_NAME + ' publishDirectMessage() method:', getErrorMessage(error));
    }
  };
}

export const authProducer = new AuthProducer();
