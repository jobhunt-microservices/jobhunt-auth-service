import { config } from '@auth/config';
import { database } from '@auth/database';
import { AuthServer } from '@auth/server';
import express, { Express } from 'express';

class Application {
  public initialize() {
    config.cloudinaryConfig();
    database.connection();

    const app: Express = express();
    const server = new AuthServer(app);

    server.start();
  }
}

const application = new Application();
application.initialize();
