import { authService } from '@auth/services/auth.service';
import { BadRequestError } from '@jobhunt-microservices/jobhunt-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

class RefreshTokenController {
  async refreshToken(req: Request, res: Response): Promise<void> {
    const { username } = req.params;
    const existingUser = await authService.getAuthUserByUsername(username);
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials', 'RefreshToken refreshToken() method error');
    }
    const userJWT = authService.signToken(existingUser.id!, existingUser.email!, existingUser.username!);
    if (!userJWT) {
      throw new BadRequestError('Error when signing token', 'RefreshToken refreshToken() method error');
    }
    res.status(StatusCodes.OK).json({ message: 'Refresh token successfully', token: userJWT });
  }
}

export const refreshTokenController = new RefreshTokenController();
