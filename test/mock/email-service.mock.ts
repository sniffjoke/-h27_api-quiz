import { UsersService } from '../../src/features/users/application/users.service';

export class EmailServiceMock extends UsersService {
  //override method
  async sendConfirmationEmail(email: string, code: string): Promise<void> {
    console.log('Call mock method sendConfirmationEmail / EmailServiceMock');

    return Promise.resolve();
  }
}
