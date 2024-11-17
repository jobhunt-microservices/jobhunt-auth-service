import { authService } from '@auth/services/auth.service';
import { generateRandomCharacters } from '@auth/utils/generate.util';
import { faker } from '@faker-js/faker';
import { BadRequestError, IAuthDocument } from '@jobhunt-microservices/jobhunt-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { lowerCase, sample } from 'lodash';
import { generateUsername } from 'unique-username-generator';
import { v4 as uuidV4 } from 'uuid';

class SeedController {
  async createSeedData(req: Request, res: Response): Promise<void> {
    const { count } = req.params;
    const usernames: string[] = [];
    for (let i = 0; i < parseInt(count, 10); i++) {
      const username: string = generateUsername('', 0, 12);
      usernames.push(lowerCase(username));
    }

    for (let i = 0; i < usernames.length; i++) {
      const username = usernames[i];
      const email = faker.internet.email();
      const password = 'Asdfgh1@3';
      const country = faker.location.country();
      const profilePicture = faker.image.urlPicsumPhotos();
      const existingUser = await authService.getAuthUserByUsernameOrEmail(username, email);
      if (existingUser) {
        throw new BadRequestError('Invalid credentials', 'Seed create() method');
      }
      const profilePublicId = uuidV4();
      const randomCharacters = await generateRandomCharacters();
      const authData: IAuthDocument = {
        username: lowerCase(username),
        email: lowerCase(email),
        profilePublicId,
        password,
        country,
        profilePicture,
        emailVerificationToken: randomCharacters,
        emailVerified: sample([0, 1])
      } as IAuthDocument;
      await authService.createAuthUser(authData);
    }
    res.status(StatusCodes.OK).json({ message: 'Seed users created successfully.' });
  }
}

export const seedController = new SeedController();
