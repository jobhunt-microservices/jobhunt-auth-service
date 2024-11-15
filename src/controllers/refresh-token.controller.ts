import { authService } from '@auth/services/auth.service';
import { IAuthDocument } from '@jobhunt-microservices/jobhunt-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

class RefreshTokenController {
  async refreshToken(req: Request, res: Response): Promise<void> {
    const { username } = req.params;
    const existingUser: IAuthDocument | undefined = await authService.getAuthUserByUsername(username);
    const userJWT: string = authService.signToken(existingUser.id!, existingUser.email!, existingUser.username!);
    res.status(StatusCodes.OK).json({ message: 'Refresh token successfully', token: userJWT });
  }
}

export const refreshTokenController = new RefreshTokenController();
