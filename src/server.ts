import 'express-async-errors';

import { config } from '@auth/config';
import { SERVICE_NAME } from '@auth/constants';
import { elasticSearch } from '@auth/elasticsearch';
import { createConnection } from '@auth/queues/connections';
import { appRoutes } from '@auth/routes';
import { logger } from '@auth/utils/logger.util';
import { CustomError, getErrorMessage, IAuthPayload, IErrorResponse } from '@jobhunt-microservices/jobhunt-shared';
import { Channel } from 'amqplib';
import compression from 'compression';
import cors from 'cors';
import { Application, json, NextFunction, Request, Response, urlencoded } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import http from 'http';
import { verify } from 'jsonwebtoken';

const SERVER_PORT = 4002;

const log = logger('authServer', 'debug');

export let authChannel: Channel;

export class AuthServer {
  private app: Application;
  constructor(app: Application) {
    this.app = app;
  }

  start = (): void => {
    this.standardMiddleware();
    this.securityMiddleware();
    this.routesMiddleware();
    this.startQueues();
    this.startElasticSearch();
    this.errorHandler();
    this.startServer();
  };

  private startElasticSearch() {
    elasticSearch.checkConnection();
  }

  private securityMiddleware() {
    this.app.set('trust proxy', 1);
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: config.API_GATEWAY_URL,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      })
    );
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.headers.authorization) {
        const token = req.headers.authorization.split('')[1];
        const payload = verify(token, `${config.JWT_TOKEN}`) as IAuthPayload;
        req.currentUser = payload;
      }
      next();
    });
  }

  private standardMiddleware(): void {
    this.app.use(compression());
    this.app.use(json({ limit: '200mb' }));
    this.app.use(urlencoded({ extended: true, limit: '200mb' }));
  }

  private routesMiddleware() {
    appRoutes(this.app);
  }

  private async startQueues() {
    authChannel = (await createConnection()) as Channel;
    if (!authChannel) {
      log.log('error', SERVICE_NAME + ` start queue failed, channel undefined`);
    }
  }

  private errorHandler(): void {
    this.app.use((error: IErrorResponse, req: Request, res: Response, next: NextFunction) => {
      log.log('error', SERVICE_NAME + ` ${error.comingFrom}:`, error.message);
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(error.serializeError());
      }
      res.status(error.statusCode).json({
        message: error.message,
        status: error.status,
        statusCode: error.statusCode,
        comingFrom: error.comingFrom
      });
    });
  }

  private async startServer(): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(this.app);
      this.startHttpServer(httpServer);
      log.info(SERVICE_NAME + ` has started with process id ${process.pid}`);
    } catch (error) {
      log.log('error', SERVICE_NAME + ` startServer() method:`, getErrorMessage(error));
    }
  }

  private async startHttpServer(httpServer: http.Server): Promise<void> {
    try {
      httpServer.listen(SERVER_PORT, () => {
        log.info(SERVICE_NAME + ` has started on port ${SERVER_PORT}`);
      });
    } catch (error) {
      log.log('error', SERVICE_NAME + ` startHttpServer() method:`, getErrorMessage(error));
    }
  }
}
