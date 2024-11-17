import { SERVICE_NAME } from '@auth/constants';
import { currentUserController } from '@auth/controllers/current-user.controller';
import { authService } from '@auth/services/auth.service';
import { BadRequestError, NotFoundError } from '@jobhunt-microservices/jobhunt-shared';
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
    mockConnection = new Sequelize(`${process.env.DATABASE_URL}`, {
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

  describe('read current user method', () => {
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

    it('should return throw exception if user not found', async () => {
      const req: Request = authMockRequest({}, { username, password }, authUserPayload) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(authService, 'getAuthUserById').mockResolvedValue(undefined);
      await currentUserController.read(req, res).catch((error) => {
        expect(error).toBeInstanceOf(NotFoundError);
        expect(NotFoundError).toHaveBeenCalledWith('User not found', SERVICE_NAME + ' CurrentUser read() method');
      });
    });
  });

  describe('resend email method', () => {
    it('should return BadRequestError if email does not exist', async () => {
      const req: Request = authMockRequest({}, { username, password }, authUserPayload) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(authService, 'getAuthUserById').mockResolvedValue(undefined);
      await currentUserController.resendEmail(req, res).catch((error) => {
        expect(error).toBeInstanceOf(BadRequestError);
        expect(BadRequestError).toHaveBeenCalledWith('Email is invalid', SERVICE_NAME + ' CurrentUser resentEmail() method error');
      });
    });

    it('should return BadRequestError if email has been verified', async () => {
      const req: Request = authMockRequest({}, { username, password }, authUserPayload) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(authService, 'getAuthUserById').mockResolvedValue({ ...authMock, emailVerified: 1 });
      await currentUserController.resendEmail(req, res).catch((error) => {
        expect(error).toBeInstanceOf(BadRequestError);
        expect(BadRequestError).toHaveBeenCalledWith('Email has been verified', SERVICE_NAME + ' CurrentUser resentEmail() method error');
      });
    });

    it('should call updateVerifyEmailField method', async () => {
      const req: Request = authMockRequest({}, { username, password }, authUserPayload) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(authService, 'getAuthUserById').mockResolvedValue(authMock);
      await currentUserController.resendEmail(req, res);
      expect(authService.updateVerifyEmailField).toHaveBeenCalled();
    });

    it('should send the email', async () => {
      const req: Request = authMockRequest({}, { username, password }, authUserPayload) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(authService, 'getAuthUserById').mockResolvedValue(authMock);
      await currentUserController.resendEmail(req, res);
      expect(authService.updateVerifyEmailField).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email verification sent',
        user: authMock
      });
    });
  });
});
