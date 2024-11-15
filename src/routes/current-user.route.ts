import { currentUserController } from '@auth/controllers/current-user.controller';
import express, { Router } from 'express';

class CurrentUserRoutes {
  router: Router;
  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/current-user', currentUserController.read);
    this.router.post('/resend-email', currentUserController.resendEmail);
    return this.router;
  }
}

export const currentUserRoutes = new CurrentUserRoutes();
