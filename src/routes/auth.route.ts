import { authController } from '@auth/controllers/auth.controller';
import express, { Router } from 'express';

class AuthRoutes {
  router: Router;
  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/signup', authController.create);
    this.router.post('/signin', authController.read);
    return this.router;
  }
}

export const authRoutes = new AuthRoutes();
