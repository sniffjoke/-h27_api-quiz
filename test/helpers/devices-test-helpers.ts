import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export class DevicesTestManager {
  constructor(
    protected readonly app: INestApplication
  ) {
  }

  async getMySessions(refreshToken: string) {
    const response = await request(this.app.getHttpServer())
      .get('/security/devices')
      .set('Cookie', `refreshToken=${refreshToken}`)
    return response;
  }

  async deleteOneSession(refreshToken: string, deviceId: string) {
    const response = await request(this.app.getHttpServer())
      .delete(`/security/devices/${deviceId}`)
      .set('Cookie', `refreshToken=${refreshToken}`)
    return response;
  }

  async deleteAllSessionsExceptCurrent(refreshToken: string) {
    const response = await request(this.app.getHttpServer())
      .delete('/security/devices')
      .set('Cookie', `refreshToken=${refreshToken}`)
    return response;
  }

}

export const createMockUser = (uniqueIndex: number) => ({
  login: 'login-' + `${uniqueIndex}`,
  email: 'email' + `${uniqueIndex}` + '@mail.ru',
  password: 'qwerty1'
})
