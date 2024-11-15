import { BASE_PATH } from '@auth/constants/path';
import { authRoutes } from '@auth/routes/auth.route';
import { healthRoutes } from '@auth/routes/health.route';
import { verifyGatewayRequest } from '@jobhunt-microservices/jobhunt-shared';
import { Application } from 'express';

export const appRoutes = (app: Application) => {
  app.use(BASE_PATH, verifyGatewayRequest, healthRoutes.routes());
  app.use(BASE_PATH, verifyGatewayRequest, authRoutes.routes());
};
