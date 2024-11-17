import { config } from '@auth/config';
import { AuthModel } from '@auth/models/auth.schema';
import { exchangeNames, routingKeys } from '@auth/queues/constants/queue.constant';
import { authProducer } from '@auth/queues/producers/auth.producer';
import { signinSchema } from '@auth/schemes/signin.scheme';
import { signupSchema } from '@auth/schemes/signup.scheme';
import { authChannel } from '@auth/server';
import { authService } from '@auth/services/auth.service';
import { BadRequestError, IAuthDocument, IEmailMessageDetails, isEmail, lowerCase, uploads } from '@jobhunt-microservices/jobhunt-shared';
import crypto from 'crypto';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';

class AuthController {
  async create(req: Request, res: Response): Promise<void> {
    const { error } = await Promise.resolve(signupSchema.validate(req.body));
    if (error?.details) {
      throw new BadRequestError(error?.details[0].message, 'Sign up create() method error');
    }
    const { username, email, password, profilePicture } = req.body;
    const existingUser = await authService.getAuthUserByUsernameOrEmail(username, email);
    if (existingUser) {
      throw new BadRequestError('User already exists', 'Sign up create() method error');
    }
    const profilePublicId = uuidv4();
    let uploadResult;
    if (profilePicture) {
      uploadResult = await uploads(profilePicture, `${profilePublicId}`, true, true);
      if (!uploadResult?.public_id) {
        throw new BadRequestError('File upload error, try again', 'Sign up create() method error');
      }
    }
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');
    const authData: IAuthDocument = {
      username: lowerCase(username),
      email: lowerCase(email),
      profilePublicId,
      password,
      profilePicture: uploadResult?.secure_url ?? null,
      emailVerificationToken: randomCharacters
    };
    const result = await authService.createAuthUser(authData);
    const verificationLink = `${config.CLIENT_URL}/confirm_email?v_token${authData.emailVerificationToken}`;
    const messageDetails: IEmailMessageDetails = {
      receiverEmail: result.email,
      verifyLink: verificationLink,
      template: 'verifyEmail'
    };
    await authProducer.publishDirectMessage(
      authChannel,
      exchangeNames.AUTH_EMAIL_NOTIFICATION,
      routingKeys.AUTH_EMAIL,
      JSON.stringify(messageDetails),
      'Verify email message has been sent to notification service'
    );
    const userJWT = authService.signToken(result.id!, result.email!, result.username!);
    if (!userJWT) {
      throw new BadRequestError('Error when signing token', 'RefreshToken refreshToken() method error');
    }
    res.status(StatusCodes.CREATED).json({ message: 'User created successfully', token: userJWT });
  }

  async read(req: Request, res: Response): Promise<void> {
    const { error } = await Promise.resolve(signinSchema.validate(req.body));
    if (error?.details) {
      throw new BadRequestError(error.details[0].message, 'SignIn read() method error');
    }
    const { username, password } = req.body;
    const isValidEmail: boolean = isEmail(username);
    const existingUser = !isValidEmail ? await authService.getAuthUserByUsername(username) : await authService.getAuthUserByEmail(username);
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials', 'SignIn read() method error');
    }
    const passwordsMatch: boolean = await AuthModel.prototype.comparePassword(password, `${existingUser.password}`);
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials', 'SignIn read() method error');
    }
    let message = 'User login successfully';
    const userJWT = authService.signToken(existingUser.id!, existingUser.email!, existingUser.username!);
    if (!userJWT) {
      throw new BadRequestError('Error when signing token', 'RefreshToken refreshToken() method error');
    }
    res.status(StatusCodes.OK).json({ message, token: userJWT });
  }
}

export const authController = new AuthController();
