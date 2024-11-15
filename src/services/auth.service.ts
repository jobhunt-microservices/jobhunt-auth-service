import { config } from '@auth/config';
import { AuthModel } from '@auth/models/auth.schema';
import { exchangeNames, routingKeys } from '@auth/queues/constants/queue.constant';
import { authProducer } from '@auth/queues/producers/auth.producer';
import { authChannel } from '@auth/server';
import { IAuthBuyerMessageDetails, IAuthDocument, lowerCase } from '@jobhunt-microservices/jobhunt-shared';
import { sign } from 'jsonwebtoken';
import { omit } from 'lodash';
import { Model, Op } from 'sequelize';

class AuthService {
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
      exchangeNames.BUYER_UPDATE,
      routingKeys.USER_BUYER,
      JSON.stringify(messageDetails),
      'Buyer details sent to buyer service'
    );
    const userData: IAuthDocument = omit(result.dataValues) as IAuthDocument;
    return userData;
  }

  async getAuthUserById(authId: number): Promise<IAuthDocument> {
    const user: Model<IAuthDocument> = (await AuthModel.findOne({
      where: { id: authId }
    })) as Model;
    return user.dataValues;
  }

  async getAuthUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
    const user: Model<IAuthDocument> = (await AuthModel.findOne({
      where: {
        [Op.or]: [{ username: lowerCase(username ?? '') }, { email: lowerCase(email ?? '') }]
      }
    })) as Model;
    return user?.dataValues;
  }

  async getAuthUserByEmail(email: string): Promise<IAuthDocument> {
    const user: Model<IAuthDocument> = (await AuthModel.findOne({
      where: { email: lowerCase(email ?? '') }
    })) as Model;
    return user?.dataValues;
  }

  async getAuthUserByUsername(username: string): Promise<IAuthDocument> {
    const user: Model<IAuthDocument> = (await AuthModel.findOne({
      where: {
        username: lowerCase(username ?? '')
      }
    })) as Model;
    return user?.dataValues;
  }

  async getAuthUserByVerificationToken(token: string): Promise<IAuthDocument> {
    const user: Model<IAuthDocument> = (await AuthModel.findOne({
      where: {
        emailVerificationToken: token
      }
    })) as Model;
    return user?.dataValues;
  }

  async getAuthUserByPasswordResetTokenToken(token: string): Promise<IAuthDocument> {
    const user: Model<IAuthDocument> = (await AuthModel.findOne({
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
    })) as Model;
    return user?.dataValues;
  }

  async updateVerifyEmailField(authId: number, emailVerified: number, emailVerificationToken?: string): Promise<void> {
    await AuthModel.update(
      {
        emailVerified,
        emailVerificationToken
      },
      {
        where: { id: authId }
      }
    );
  }

  async updatePasswordToken(authId: number, token: string, tokenExpiration: Date): Promise<void> {
    await AuthModel.update(
      {
        passwordResetToken: token,
        passwordResetExpires: tokenExpiration
      },
      {
        where: { id: authId }
      }
    );
  }

  async updatePassword(authId: number, password: string): Promise<void> {
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
  }

  signToken(id: number, email: string, username: string): string {
    const signedToken = sign(
      {
        id,
        email,
        username
      },
      `${config.JWT_TOKEN}`
    );
    return signedToken;
  }
}

export const authService = new AuthService();
