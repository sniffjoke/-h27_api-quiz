import { ExecutionContext, INestApplication } from '@nestjs/common';
import { initSettings } from '../helpers/init-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { UsersService } from '../../src/features/users/application/users.service';
import { JwtService } from '@nestjs/jwt';
import { createMockUser, UsersTestManager } from '../helpers/users-test-helpers';
import { AuthTestManager, mockLoginData } from '../helpers/auth-test-helpers';
import { DevicesTestManager } from '../helpers/devices-test-helpers';
import { ThrottlerGuard } from '@nestjs/throttler';

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('DevicesController (e2e)', () => {
  let app: INestApplication;
  let usersManager: UsersTestManager;
  let usersService: UsersService;
  let authManager: AuthTestManager;
  let refreshToken: string;
  let devicesManager: DevicesTestManager;


  beforeAll(async () => {
    const result = await initSettings(
      (moduleBuilder) =>
        moduleBuilder
          .overrideGuard(ThrottlerGuard)
          .useValue({
            canActivate: (_context: ExecutionContext) => true, // Разрешаем все запросы
          })
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
    devicesManager = result.deviceTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });


  describe('/security/devices (e2e)', () => {
    it('/security/devices (GET)', async () => {
      const emailConfirmationInfo = usersService.createEmailConfirmation(true);
      const createUser = await usersManager.createUser(createMockUser(1), emailConfirmationInfo);
      const logins = await authManager.createMultipleEnters(5, mockLoginData(1), 5);
      const cookie = logins[logins.length - 1].headers['set-cookie'][0];
      expect(cookie).toBeDefined();
      refreshToken = cookie.split(';')[0].split('=')[1];
      expect(refreshToken).toBeDefined();
      const devices = await devicesManager.getMySessions(refreshToken);
      expect(devices.status).toBe(200);
      expect(Array.isArray(devices.body)).toBe(true);
      expect(devices.body.length).toBeGreaterThan(0);
      devices.body.forEach((device: any) => {
        expect(device).toHaveProperty('deviceId');
        expect(device).toHaveProperty('ip');
        expect(device).toHaveProperty('title');
        expect(device).toHaveProperty('lastActiveDate');
      });
      devices.body.forEach((device: any) => {
        expect(device.lastActiveDate).toBeDefined();
        expect(new Date(device.lastActiveDate).toISOString()).toContain('T');
      });
      expect(devices.body[0]).toEqual(
        expect.objectContaining({
          deviceId: expect.any(String),
          ip: expect.any(String),
          title: expect.any(String),
          lastActiveDate: expect.any(String),
        }),
      );
    });

    it('/security/devices/:sessionId (DELETE)', async () => {
      const emailConfirmationInfo = usersService.createEmailConfirmation(true);
      const createUser = await usersManager.createUser(createMockUser(2), emailConfirmationInfo);
      const logins = await authManager.createMultipleEnters(5, mockLoginData(2), 10);
      const cookie = logins[logins.length - 1].headers['set-cookie'][0];
      expect(cookie).toBeDefined();
      refreshToken = cookie.split(';')[0].split('=')[1];
      expect(refreshToken).toBeDefined();
      const devices = await devicesManager.getMySessions(refreshToken);
      const response = await devicesManager.deleteOneSession(refreshToken, devices.body[0].deviceId);
      const devicesAfterDelete = await devicesManager.getMySessions(refreshToken);
      expect(devicesAfterDelete.body.length).toBeLessThan(devices.body.length);
      expect(response.status).toBe(204);
    });

    it('/security/devices (DELETE)', async () => {
      const emailConfirmationInfo = usersService.createEmailConfirmation(true);
      const createUser = await usersManager.createUser(createMockUser(3), emailConfirmationInfo);
      const logins = await authManager.createMultipleEnters(5, mockLoginData(3), 15);
      const devices = await devicesManager.getMySessions(refreshToken);
      const cookie = logins[logins.length - 1].headers['set-cookie'][0];
      expect(cookie).toBeDefined();
      refreshToken = cookie.split(';')[0].split('=')[1];
      expect(refreshToken).toBeDefined();
      const response = await devicesManager.deleteAllSessionsExceptCurrent(refreshToken);
      const devicesAfterDelete = await devicesManager.getMySessions(refreshToken);
      expect(devicesAfterDelete.body.length).toBeLessThan(devices.body.length);
      expect(devicesAfterDelete.body.length).toBe(1);
      expect(response.status).toBe(204);
    });
  });

  describe('NotFound (e2e)', () => {
    it('should return 404 if deviceId field from URL not found on delete device', async () => {
      const emailConfirmationInfo = usersService.createEmailConfirmation(true);
      const createUser = await usersManager.createUser(createMockUser(4), emailConfirmationInfo);
      const logins = await authManager.createMultipleEnters(5, mockLoginData(4), 20);
      const cookie = logins[logins.length - 1].headers['set-cookie'][0];
      expect(cookie).toBeDefined();
      refreshToken = cookie.split(';')[0].split('=')[1];
      expect(refreshToken).toBeDefined();
      const devices = await devicesManager.getMySessions(refreshToken);
      const deletedId = devices.body[devices.body.length - 1].deviceId;
      const firstDeleteResponse = await devicesManager.deleteOneSession(refreshToken, deletedId)
      const secondDeleteResponse = await devicesManager.deleteOneSession(refreshToken, deletedId)
      expect(secondDeleteResponse.status).toBe(404);
      expect(secondDeleteResponse.body).toHaveProperty('statusCode', 404);
      expect(secondDeleteResponse.body).toHaveProperty('message');
    });
  });

  describe('AuthGuard (e2e)', () => {
    it('should return 401 when no token provided', async () => {
      const emailConfirmationInfo = usersService.createEmailConfirmation(true);
      const createUser = await usersManager.createUser(createMockUser(5), emailConfirmationInfo);
      const logins = await authManager.createMultipleEnters(5, mockLoginData(5), 25);
      const cookie = logins[logins.length - 1].headers['set-cookie'][0];
      expect(cookie).toBeDefined();
      refreshToken = '';
      const response = await devicesManager.getMySessions(refreshToken);
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    });
  });

});
