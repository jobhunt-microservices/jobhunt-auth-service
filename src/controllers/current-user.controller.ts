import { config } from '@auth/config';
import { SERVICE_NAME } from '@auth/constants';
import { exchangeNames, routingKeys } from '@auth/queues/constants/queue.constant';
import { authProducer } from '@auth/queues/producers/auth.producer';
import { authChannel } from '@auth/server';
import { authService } from '@auth/services/auth.service';
import { BadRequestError, IAuthDocument, IEmailMessageDetails, NotFoundError } from '@jobhunt-microservices/jobhunt-shared';
import crypto from 'crypto';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

class CurrentUserController {
  async read(req: Request, res: Response): Promise<void> {
    const existingUser: IAuthDocument | undefined = await authService.getAuthUserById(req.currentUser!.id);
    if (!existingUser) {
      throw new NotFoundError('User not found', SERVICE_NAME + ' CurrentUser read() method');
    }
    res.status(StatusCodes.OK).json({ message: 'Authenticated user', user: existingUser });
  }
  async resendEmail(req: Request, res: Response): Promise<void> {
    const { userId } = req.body;
    const existingUser: IAuthDocument | undefined = await authService.getAuthUserById(userId);
    if (!existingUser) {
      throw new BadRequestError('Email is invalid', SERVICE_NAME + ' CurrentUser resentEmail() method error');
    }
    if (existingUser.emailVerified) {
      throw new BadRequestError('Email has been verified', SERVICE_NAME + ' CurrentUser resentEmail() method error');
    }
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');
    const verificationLink = `${config.CLIENT_URL}/confirm_email?v_token=${randomCharacters}`;
    await authService.updateVerifyEmailField(existingUser.id!, 0, randomCharacters);
    const messageDetails: IEmailMessageDetails = {
      receiverEmail: existingUser.email,
      verifyLink: verificationLink,
      template: 'verifyEmail'
    };
    await authProducer.publishDirectMessage(
      authChannel,
      exchangeNames.EMAIL_NOTIFICATION,
      routingKeys.AUTH_EMAIL,
      JSON.stringify(messageDetails),
      'Verify email message has been sent to notification service.'
    );
    const updatedUser = await authService.getAuthUserById(existingUser.id!);
    res.status(StatusCodes.OK).json({ message: 'Email verification sent', user: updatedUser });
  }
}

export const currentUserController = new CurrentUserController();
