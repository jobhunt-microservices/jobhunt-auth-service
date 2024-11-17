import { config } from '@auth/config';
import { SERVICE_NAME } from '@auth/constants';
import { logger } from '@auth/utils/logger.util';
import { Client } from '@elastic/elasticsearch';
import { getErrorMessage, ISellerGig } from '@jobhunt-microservices/jobhunt-shared';

const log = logger('authElasticSearchConnection', 'debug');

class ElasticSearch {
  public elasticSearchClient: Client;

  constructor() {
    this.elasticSearchClient = new Client({
      node: `${config.ELASTIC_SEARCH_URL}`
    });
  }

  public async checkConnection(): Promise<void> {
    let isConnected = false;
    while (!isConnected) {
      try {
        const health = await this.elasticSearchClient.cluster.health({});
        log.info(SERVICE_NAME + ` elasticsearch health status - ${health.status}`);
        isConnected = true;
      } catch (error) {
        log.error(SERVICE_NAME + ' connection to elasticsearch failed, retrying');
        await new Promise((resolve) => setTimeout(resolve, 5000));
        log.log('error', SERVICE_NAME + ' checkConnection() method:', getErrorMessage(error));
      }
    }
  }

  private async checkIfIndexExist(indexName: string) {
    const result = await this.elasticSearchClient.indices.exists({ index: indexName });
    return result;
  }

  async createIndex(indexName: string): Promise<void> {
    try {
      const result: boolean = await this.checkIfIndexExist(indexName);
      if (result) {
        log.info(`Index "${indexName}" already exist.`);
      } else {
        await this.elasticSearchClient.indices.create({ index: indexName });
        await this.elasticSearchClient.indices.refresh({ index: indexName });
        log.info(`Created index ${indexName}`);
      }
    } catch (error) {
      log.error(`An error occurred while creating the index ${indexName}`);
      log.log('error', SERVICE_NAME + ' createIndex() method error:', getErrorMessage(error));
    }
  }

  async getDocumentById(index: string, id: string) {
    try {
      const result = await this.elasticSearchClient.get({
        index,
        id
      });
      return result._source as ISellerGig;
    } catch (error) {
      log.log('error', SERVICE_NAME + ' getDocumentById() method error:', getErrorMessage(error));
      return {} as ISellerGig;
    }
  }
}

export const elasticSearch = new ElasticSearch();
