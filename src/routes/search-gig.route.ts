import { searchGigsController } from '@auth/controllers/search-gigs.controller';
import express, { Router } from 'express';

class SearchGigsRoutes {
  router: Router;
  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/gigs/search/:from/:size/:type', searchGigsController.gigsSearch);
    this.router.get('/gigs/search/:id', searchGigsController.singleGigSearchById);
    return this.router;
  }
}

export const searchGigsRoutes = new SearchGigsRoutes();
