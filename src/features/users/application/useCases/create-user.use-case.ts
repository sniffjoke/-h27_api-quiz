import { CreateUserDto, EmailConfirmationModel } from '../../api/models/input/create-user.dto';
import { CryptoService } from '../../../../core/modules/crypto/application/crypto.service';
import { UsersService } from '../users.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../../core/settings/env/configuration';
import { UsersRepositoryTO } from '../../infrastructure/users.repository.to';

export class CreateUserCommand {
  constructor(
    public createUserDto: CreateUserDto,
    public isConfirm: boolean
  ) {
  }

}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase
  implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly usersRepository: UsersRepositoryTO,
    private readonly usersService: UsersService,
    private readonly cryptoService: CryptoService,
    private configService: ConfigService<ConfigurationType, true>
  ) {

  }

  async execute(command: CreateUserCommand) {
    const apiSettings = this.configService.get('apiSettings', {
      infer: true,
    });
    const isUserExists = await this.usersRepository.checkIsUserExists(command.createUserDto.login, command.createUserDto.email);
    const emailConfirmationDto: EmailConfirmationModel = this.usersService.createEmailConfirmation(command.isConfirm);
    if (!command.isConfirm) {
      await this.usersService.sendActivationEmail(command.createUserDto.email, `${apiSettings.API_URL}/?code=${emailConfirmationDto.confirmationCode as string}`);
    }
    const hashPassword = await this.cryptoService.hashPassword(command.createUserDto.password);
    const newUserData = { ...command.createUserDto, password: hashPassword };
    const userSave = await this.usersRepository.createUser(newUserData, emailConfirmationDto);
    return userSave.id;
  }
}
