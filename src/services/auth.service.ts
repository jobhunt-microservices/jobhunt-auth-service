import { config } from '@auth/config';
import { AuthModel } from '@auth/models/auth.schema';
import { exchangeNames, routingKeys } from '@auth/queues/constants/queue.constant';
import { authProducer } from '@auth/queues/producers/auth.producer';
import { authChannel } from '@auth/server';
import { logger } from '@auth/utils/logger.util';
import { getErrorMessage, IAuthBuyerMessageDetails, IAuthDocument, lowerCase } from '@jobhunt-microservices/jobhunt-shared';
import { sign } from 'jsonwebtoken';
import { omit } from 'lodash';
import { Model, Op } from 'sequelize';

const log = logger('authService', 'debug');

export class AuthService {
  async createAuthUser(data: IAuthDocument): Promise<IAuthDocument> {
    const result: Model = await AuthModel.create(data);
    const messageDetails: IAuthBuyerMessageDetails = {
      username: result.dataValues.username,
      email: result.dataValues.email,
      profilePicture: result.dataValues.profilePicture,
      type: 'auth'
    };
    await authProducer.publishDirectMessage(
      authChannel,
      exchangeNames.AUTH_NOTIFICATION,
      routingKeys.AUTH_USER,
      JSON.stringify(messageDetails),
      'User has been created'
    );
    const userData: IAuthDocument = omit(result.dataValues) as IAuthDocument;
    return userData;
  }

  async getAuthUserById(authId: number) {
    try {
      const user = await AuthModel.findOne({
        where: { id: authId }
      });
      return user?.dataValues;
    } catch (error) {
      log.error(getErrorMessage(error));
    }
  }

  async getAuthUserByUsernameOrEmail(username: string, email: string) {
    try {
      const user: Model<IAuthDocument> = (await AuthModel.findOne({
        where: {
          [Op.or]: [{ username: lowerCase(username ?? '') }, { email: lowerCase(email ?? '') }]
        }
      })) as Model;
      return user?.dataValues;
    } catch (error) {
      log.error(getErrorMessage(error));
    }
  }

  async getAuthUserByEmail(email: string) {
    try {
      const user = await AuthModel.findOne({
        where: { email: lowerCase(email ?? '') }
      });
      return user?.dataValues;
    } catch (error) {
      log.error(getErrorMessage(error));
    }
  }

  async getAuthUserByUsername(username: string) {
    try {
      const user = await AuthModel.findOne({
        where: {
          username: lowerCase(username ?? '')
        }
      });
      return user?.dataValues;
    } catch (error) {
      log.error(getErrorMessage(error));
    }
  }

  async getAuthUserByVerificationToken(token: string) {
    try {
      const user = await Promise.resolve(
        AuthModel.findOne({
          where: {
            emailVerificationToken: token
          }
        })
      );
      return user?.dataValues;
    } catch (error) {
      log.error(getErrorMessage(error));
    }
  }

  async getAuthUserByPasswordResetTokenToken(token: string) {
    try {
      const user = await AuthModel.findOne({
        where: {
          [Op.and]: [
            {
              passwordResetToken: token
            },
            {
              passwordResetExpires: {
                [Op.gt]: new Date()
              }
            }
          ]
        }
      });
      return user?.dataValues;
    } catch (error) {
      log.error(getErrorMessage(error));
    }
  }

  async updateVerifyEmailField(authId: number, emailVerified: number, emailVerificationToken?: string): Promise<void> {
    try {
      await AuthModel.update(
        {
          emailVerified,
          emailVerificationToken
        },
        {
          where: { id: authId }
        }
      );
    } catch (error) {
      log.error(getErrorMessage(error));
    }
  }

  async updatePasswordToken(authId: number, token: string, tokenExpiration: Date): Promise<void> {
    try {
      await AuthModel.update(
        {
          passwordResetToken: token,
          passwordResetExpires: tokenExpiration
        },
        {
          where: { id: authId }
        }
      );
    } catch (error) {
      log.error(getErrorMessage(error));
    }
  }

  async updatePassword(authId: number, password: string): Promise<void> {
    try {
      await AuthModel.update(
        {
          password,
          passwordResetToken: '',
          passwordResetExpires: new Date()
        },
        {
          where: { id: authId }
        }
      );
    } catch (error) {
      log.error(getErrorMessage(error));
    }
  }

  signToken(id: number, email: string, username: string) {
    try {
      const signedToken = sign(
        {
          id,
          email,
          username
        },
        `${config.JWT_TOKEN}`
      );
      return signedToken;
    } catch (error) {
      log.error(getErrorMessage(error));
    }
  }
}

export const authService = new AuthService();
