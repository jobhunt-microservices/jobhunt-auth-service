import { authService } from '@auth/services/auth.service';
import { BadRequestError } from '@jobhunt-microservices/jobhunt-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

class VerifyEmailController {
  async verifyEmail(req: Request, res: Response): Promise<void> {
    const token = req.query?.token as string;
    const existingUser = await authService.getAuthUserByVerificationToken(token);
    if (!existingUser) {
      throw new BadRequestError('Verification token is either invalid or is already used.', 'VerifyEmail update() method error');
    }
    await authService.updateVerifyEmailField(existingUser.id!, 1);
    const updatedUser = await authService.getAuthUserById(existingUser.id!);
    res.status(StatusCodes.OK).json({ message: 'Email verified successfully.', user: updatedUser });
  }
}

export const verifyEmailController = new VerifyEmailController();
