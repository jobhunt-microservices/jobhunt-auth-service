import cloudinary from 'cloudinary';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({});

class Config {
  public NODE_ENV: string | undefined;
  public CLIENT_URL: string | undefined;
  public GATEWAY_JWT_TOKEN: string | undefined;
  public RABBITMQ_ENDPOINT: string | undefined;
  public MYSQL_DB: string | undefined;
  public CLOUND_NAME: string | undefined;
  public CLOUND_API_KEY: string | undefined;
  public CLOUND_API_SECRET: string | undefined;
  public JWT_TOKEN: string | undefined;
  public API_GATEWAY_URL: string | undefined;
  public ELASTIC_SEARCH_URL: string | undefined;
  public ELASTIC_APM_SERVER_URL: string | undefined;
  public ELASTIC_APM_SECRET_TOKEN: string | undefined;

  constructor() {
    this.NODE_ENV = process.env.NODE_ENV || '';
    this.CLIENT_URL = process.env.CLIENT_URL || '';
    this.GATEWAY_JWT_TOKEN = process.env.GATEWAY_JWT_TOKEN || '';
    this.RABBITMQ_ENDPOINT = process.env.RABBITMQ_ENDPOINT || '';
    this.MYSQL_DB = process.env.MYSQL_DB || '';
    this.CLOUND_NAME = process.env.CLOUND_NAME || '';
    this.CLOUND_API_KEY = process.env.CLOUND_API_KEY || '';
    this.CLOUND_API_SECRET = process.env.CLOUND_API_SECRET || '';
    this.JWT_TOKEN = process.env.JWT_TOKEN || '';
    this.API_GATEWAY_URL = process.env.API_GATEWAY_URL || '';
    this.ELASTIC_SEARCH_URL = process.env.ELASTIC_SEARCH_URL || '';
    this.ELASTIC_APM_SERVER_URL = process.env.ELASTIC_APM_SERVER_URL || '';
    this.ELASTIC_APM_SECRET_TOKEN = process.env.ELASTIC_APM_SECRET_TOKEN || '';
  }

  cloudinaryConfig(): void {
    cloudinary.v2.config({
      cloud_name: this.CLOUND_NAME,
      api_key: this.CLOUND_API_KEY,
      api_secret: this.CLOUND_API_SECRET
    });
  }
}

export const config: Config = new Config();
