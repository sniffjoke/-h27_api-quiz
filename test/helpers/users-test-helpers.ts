import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../src/core/settings/env/configuration';
import { CreateUserDto, EmailConfirmationModel } from '../../src/features/users/api/models/input/create-user.dto';
import request from 'supertest';
import { codeAuth } from './test-helpers';

export class UsersTestManager {
  constructor(
    protected readonly app: INestApplication,
    private configService: ConfigService<ConfigurationType, true>,
  ) {
  }

  async createUser(createModel: CreateUserDto, emailConfirmation: EmailConfirmationModel) {
    const apiSettings = this.configService.get('apiSettings', { infer: true });
    const response = await request(this.app.getHttpServer())
      .post('/sa/users')
      .send({ ...createModel, emailConfirmation })
      .set({ 'Authorization': `Basic ` + codeAuth(apiSettings.ADMIN) });
    return response;
  }

  async createUserWOAuth(createModel: CreateUserDto, emailConfirmation: EmailConfirmationModel) {
    const response = await request(this.app.getHttpServer())
      .post('/sa/users')
      .send({ ...createModel, emailConfirmation })
    return response;
  }

  async getUsersWithSA() {
    const apiSettings = this.configService.get('apiSettings', { infer: true });
    const response = await request(this.app.getHttpServer())
      .get('/sa/users')
      .set({ 'Authorization': `Basic ` + codeAuth(apiSettings.ADMIN) });
    return response;
  }

  async deleteUser(userId: string) {
    const apiSettings = this.configService.get('apiSettings', { infer: true });
    const response = await request(this.app.getHttpServer())
      .delete('/sa/users/' + `${userId}`)
      .set({ 'Authorization': `Basic ` + codeAuth(apiSettings.ADMIN) })
    return response
  }
}

export const createMockUser = (uniqueIndex: number) => ({
  login: 'login-' + `${uniqueIndex}`,
  email: 'email' + `${uniqueIndex}` + '@mail.ru',
  password: 'qwerty1'
})
