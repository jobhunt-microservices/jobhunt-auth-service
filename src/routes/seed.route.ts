import { seedController } from '@auth/controllers/seed.controller';
import express, { Router } from 'express';

class SeedRoutes {
  router: Router;
  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.put('/seed/:count', seedController.createSeedData);
    return this.router;
  }
}

export const seedRoutes = new SeedRoutes();
