import { currentUserController } from '@auth/controllers/current-user.controller';
import { authService } from '@auth/services/auth.service';
import { NotFoundError } from '@jobhunt-microservices/jobhunt-shared';
import { Request, Response } from 'express';
import { Sequelize } from 'sequelize';
import { authMock, authMockRequest, authMockResponse, authUserPayload } from './mocks/auth.mock';

jest.mock('@jobhunt-microservices/jobhunt-shared');
jest.mock('@auth/services/auth.service');
jest.mock('@auth/queues/producers/auth.producer');
jest.mock('@elastic/elasticsearch');

const username = 'joe';
const password = 'joe_pw';
let mockConnection: Sequelize;

describe('CurrentUser', () => {
  beforeEach(async () => {
    jest.resetAllMocks();
    mockConnection = new Sequelize(`${process.env.MYSQL_DB}`, {
      dialect: 'mysql',
      logging: false,
      dialectOptions: {
        multipleStatements: true
      }
    });
    await mockConnection.sync({ force: true });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await mockConnection.close();
  });

  describe('read method', () => {
    it('should return authenticated user', async () => {
      const req: Request = authMockRequest({}, { username, password }, authUserPayload) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(authService, 'getAuthUserById').mockResolvedValue(authMock);
      await currentUserController.read(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authenticated user',
        user: authMock
      });
    });

    it('should return empty user', async () => {
      const req: Request = authMockRequest({}, { username, password }, authUserPayload) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(authService, 'getAuthUserById').mockResolvedValue(undefined);
      await currentUserController.read(req, res).catch((error) => {
        expect(error).toBeInstanceOf(NotFoundError);
      });
    });
  });
});
