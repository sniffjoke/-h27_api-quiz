import { INestApplication } from '@nestjs/common';
import { initSettings } from '../helpers/init-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { UsersService } from '../../src/features/users/application/users.service';
import { JwtService } from '@nestjs/jwt';
import { TokensService } from '../../src/features/tokens/application/tokens.service';
import { createMockUser, UsersTestManager } from '../helpers/users-test-helpers';
import { AuthTestManager, mockLoginData } from '../helpers/auth-test-helpers';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let usersManager: UsersTestManager;
  let usersService: UsersService;
  let authManager: AuthTestManager;
  let tokensService: TokensService;
  let refreshToken: string;
  let accessToken: string;


  beforeAll(async () => {
    const result = await initSettings(
      (moduleBuilder) =>
        moduleBuilder
          .overrideProvider(JwtService)
          .useValue(
            new JwtService({
              secret: 'secret_key',
              signOptions: { expiresIn: '2s' },
            }),
          ),
    );
    app = result.app;
    usersManager = result.userTestManager;
    usersService = result.usersService;
    authManager = result.authTestManager;
    tokensService = result.tokensService;
    await deleteAllData(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth (e2e)', () => {
    it('/auth/login (POST)', async () => {
      const emailConfirmationInfo = usersService.createEmailConfirmation(true);
      const createUser = await usersManager.createUser(createMockUser(1), emailConfirmationInfo);
      const loginUser = await authManager.login(mockLoginData(1));
      expect(loginUser.status).toBe(200);
      const cookie = loginUser.headers['set-cookie'][0];
      expect(cookie).toBeDefined();
      expect(loginUser.body).toHaveProperty('accessToken');
      expect(loginUser.body).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String),
        }),
      );
      refreshToken = cookie.split(';')[0].split('=')[1];
      accessToken = loginUser.body.accessToken;
      expect(refreshToken).toBeDefined();
    });

    it('/auth/refresh (POST)', async () => {
      const validateRefreshToken = await tokensService.validateRefreshToken(refreshToken);
      const refresh = await authManager.refresh(refreshToken);
      expect(refresh.status).toBe(200);
      expect(validateRefreshToken).toHaveProperty('_id');
      expect(validateRefreshToken).toHaveProperty('deviceId');
      expect(validateRefreshToken).toHaveProperty('iat');
      expect(validateRefreshToken).toHaveProperty('exp');
      expect(refresh.body).toHaveProperty('accessToken');
      expect(refresh.body).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String),
        }),
      );
      const cookie = refresh.headers['set-cookie'][0];
      refreshToken = cookie.split(';')[0].split('=')[1];
      accessToken = refresh.body.accessToken;
    });

    it('/auth/me (GET)', async () => {
      const validateAccessToken = await tokensService.validateAccessToken(accessToken);
      const getMe = await authManager.getMe(accessToken);
      expect(getMe.status).toBe(200);
      expect(validateAccessToken).toHaveProperty('_id');
      expect(validateAccessToken).toHaveProperty('iat');
      expect(validateAccessToken).toHaveProperty('exp');
      expect(getMe.body).toHaveProperty('userId');
      expect(getMe.body).toHaveProperty('login');
      expect(getMe.body).toHaveProperty('email');
      expect(getMe.body).toEqual(
        expect.objectContaining({
          userId: expect.any(String),
          login: expect.any(String),
          email: expect.any(String),
        }),
      );
    });

    it('/auth/logout (POST)', async () => {
      const validateRefreshToken = await tokensService.validateRefreshToken(refreshToken);
      const logout = await authManager.logout(refreshToken);
      expect(logout.status).toBe(204);
      expect(validateRefreshToken).toHaveProperty('_id');
      expect(validateRefreshToken).toHaveProperty('deviceId');
      expect(validateRefreshToken).toHaveProperty('iat');
      expect(validateRefreshToken).toHaveProperty('exp');
    });

    it('/auth/registration (POST)', async () => {
      const sendMailMethod = (app.get(UsersService).sendActivationEmail = jest
        .fn()
        .mockImplementation(() => Promise.resolve()));
      const emailConfirmationInfo = usersService.createEmailConfirmation(false);
      const user = await authManager.registration(createMockUser(2), emailConfirmationInfo);
      expect(user.status).toBe(204);
      expect(sendMailMethod).toHaveBeenCalled();
      // expect(user.body).toHaveProperty('id');
      // expect(user.body).toHaveProperty('login');
      // expect(user.body).toHaveProperty('email');
      // expect(user.body).toHaveProperty('createdAt');
      // expect(new Date(user.body.createdAt).toISOString()).toContain('T');
      // expect(user.body.createdAt).toBeDefined();
      // expect(user.body).toEqual(
      //   expect.objectContaining({
      //     id: expect.any(String),
      //     login: expect.any(String),
      //     email: expect.any(String),
      //     createdAt: expect.any(String),
      //   }),
      // );
    });

  });

  describe('AuthGuard (e2e)', () => {
    it('should return 401 when no correct credentials', async () => {
      const emailConfirmationInfo = usersService.createEmailConfirmation(true);
      const createUser = await usersManager.createUser(createMockUser(3), emailConfirmationInfo);
      const loginUser = await authManager.login(mockLoginData(4));
      expect(loginUser.status).toBe(401);
      expect(loginUser.body).toHaveProperty('message');
      expect(typeof loginUser.body.message).toBe('string');
    });
  });

  describe('BadRequest (e2e)', () => {
    it('should return 400 if login or email already exists on registration', async () => {
      const sendMailMethod = (app.get(UsersService).sendActivationEmail = jest
        .fn()
        .mockImplementation(() => Promise.resolve()));
      const emailConfirmationInfo = usersService.createEmailConfirmation(false);
      const createUser = await usersManager.createUser(createMockUser(5), emailConfirmationInfo);
      const invalidPayload = createMockUser(5);
      const response = await authManager.registration(invalidPayload, emailConfirmationInfo);
      expect(sendMailMethod).not.toHaveBeenCalled();
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errorsMessages');
      expect(Array.isArray(response.body.errorsMessages)).toBe(true);
      response.body.errorsMessages.forEach((error) => {
        expect(error).toEqual(
          expect.objectContaining({
            message: expect.any(String),
          }),
        );
      });
      response.body.errorsMessages.forEach((error: any) => {
        expect(['login', 'email']).toContain(error.field);
      });
    });

    it('should return 400 if required field is missing on registration', async () => {
      const sendMailMethod = (app.get(UsersService).sendActivationEmail = jest
        .fn()
        .mockImplementation(() => Promise.resolve()));
      const invalidPayload = {
        login: '',
        email: 'InvalidUrl',
        password: 'Valid Password',
      };
      const emailConfirmationInfo = usersService.createEmailConfirmation(true);

      const response = await authManager.registration(invalidPayload, emailConfirmationInfo);
      expect(response.status).toBe(400);
      expect(sendMailMethod).not.toHaveBeenCalled();
      expect(response.body).toHaveProperty('errorsMessages');
      expect(Array.isArray(response.body.errorsMessages)).toBe(true);
      response.body.errorsMessages.forEach((error) => {
        expect(error).toEqual(
          expect.objectContaining({
            message: expect.any(String),
          }),
        );
      });
      response.body.errorsMessages.forEach((error: any) => {
        expect(['login', 'email']).toContain(error.field);
      });
    });

  });

  // describe('NotFound (e2e)', () => {
  //   it('should return 404 if id field from URL not found on delete user', async () => {
  //     const confirmationInfo = usersService.createEmailConfirmation(true);
  //     const user = await usersManager.createUser(createMockUser(14), confirmationInfo);
  //     const deleteUser = await usersManager.deleteUser(user.body.id);
  //     const response = await usersManager.deleteUser(user.body.id);
  //     expect(response.status).toBe(404);
  //     expect(response.body).toHaveProperty('statusCode', 404);
  //     expect(response.body).toHaveProperty('message');
  //   });
  //
  // });
  //


});
