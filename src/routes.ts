import { BASE_PATH } from '@auth/constants/path';
import { authRoutes } from '@auth/routes/auth.route';
import { currentUserRoutes } from '@auth/routes/current-user.route';
import { healthRoutes } from '@auth/routes/health.route';
import { tokenRoutes } from '@auth/routes/token.route';
import { verifyGatewayRequest } from '@jobhunt-microservices/jobhunt-shared';
import { Application } from 'express';

export const appRoutes = (app: Application) => {
  app.use(BASE_PATH, verifyGatewayRequest, healthRoutes.routes());
  app.use(BASE_PATH, verifyGatewayRequest, authRoutes.routes());
  app.use(BASE_PATH, verifyGatewayRequest, currentUserRoutes.routes());
  app.use(BASE_PATH, verifyGatewayRequest, tokenRoutes.routes());
};
