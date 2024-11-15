import { SERVICE_NAME } from '@auth/constants';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class HealthController {
  public health(req: Request, res: Response) {
    res.status(StatusCodes.OK).send(SERVICE_NAME + ' is healthy');
  }
}

export const healthController = new HealthController();
