import { INestApplication } from '@nestjs/common';
import { CreateUserDto, EmailConfirmationModel } from '../../src/features/users/api/models/input/create-user.dto';
import request from 'supertest';
import { LoginDto } from '../../src/features/auth/api/models/input/auth.input.model';

export class AuthTestManager {
  constructor(
    protected readonly app: INestApplication,
  ) {
  }

  async registration(createModel: CreateUserDto, emailConfirmation: EmailConfirmationModel) {
    const response = await request(this.app.getHttpServer())
      .post('/auth/registration')
      .send({ ...createModel, emailConfirmation })
    return response;
  }

  async login(createModel: LoginDto) {
    const response = await request(this.app.getHttpServer())
      .post('/auth/login')
      .set('user-agent', 'Custom-agent-v1')
      .send(createModel)
    return response;
  }

  async createMultipleEnters(amount: number, loginData: LoginDto, step: number) {
    let logins: any = []
    for (let i = 1; i < amount; i++) {
      let response = await request(this.app.getHttpServer())
        .post('/auth/login')
        .set('user-agent', `Custom-agent-v${i+step}`)
        .set('X-Forwarded-For', `192.168.1.0${i+step}`)
        .send(loginData)
      logins.push(response)
    }
    return logins
  }

  async refresh(refreshToken: string) {
    const response = await request(this.app.getHttpServer())
      .post('/auth/refresh-token')
      .set('Cookie', `refreshToken=${refreshToken}`)
    return response;
  }

  async getMe(accessToken: string) {
    const response = await request(this.app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
    return response;
  }

  async logout(refreshToken: string) {
    const response = await request(this.app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', [`refreshToken=${refreshToken}`])
    return response;
  }

}

export const mockLoginData = (uniqueIndex: number): LoginDto => ({
  loginOrEmail: 'login-' + `${uniqueIndex}`,
  password: 'qwerty1'
})
