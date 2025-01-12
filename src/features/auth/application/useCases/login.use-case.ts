import { LoginDto } from '../../api/models/input/auth.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CryptoService } from '../../../../core/modules/crypto/application/crypto.service';
import { UnauthorizedException } from '@nestjs/common';
import { UuidService } from 'nestjs-uuid';
import { TokensService } from '../../../tokens/application/tokens.service';
import { UsersRepositoryTO } from '../../../users/infrastructure/users.repository.to';
import { DevicesRepositoryTO } from '../../../devices/infrastructure/devices.repository.to';
import { TokensRepositoryTO } from '../../../tokens/infrastructure/tokens.repository.to';

export class LoginCommand {
  constructor(
    public loginDto: LoginDto,
    public myIp: string,
    public userAgent: string,
  ) {
  }

}

@CommandHandler(LoginCommand)
export class LoginUseCase
  implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly usersRepository: UsersRepositoryTO,
    private readonly cryptoService: CryptoService,
    private readonly devicesRepository: DevicesRepositoryTO,
    private readonly uuidService: UuidService,
    private readonly tokensService: TokensService,
    private readonly tokensRepository: TokensRepositoryTO
  ) {

  }

  async execute(command: LoginCommand) {
    const findedUser = await this.usersRepository.findUserByLogin(command.loginDto.loginOrEmail);
    const comparePass = await this.cryptoService.comparePassword(command.loginDto.password, findedUser.password);
    if (!comparePass) {
      throw new UnauthorizedException('Password not match');
    }
    const findSession = await this.devicesRepository.findManyDevices({
      userId: findedUser.id,
      ip: command.myIp,
      title: command.userAgent,
    });
    const deviceData: any = {
      userId: findedUser.id,
      deviceId: findSession ? findSession.deviceId : this.uuidService.generate(),
      ip: command.myIp,
      title: command.userAgent,
      lastActiveDate: new Date(Date.now()).toISOString(),
    };
    const {
      accessToken,
      refreshToken,
    } = this.tokensService.createTokens(findedUser.id, deviceData.deviceId);
    if (findSession) {
      await this.devicesRepository.updateDeviceById(findSession.id, new Date(Date.now()).toISOString());
      const tokenData = {
        userId: findedUser.id,
        refreshToken,
        blackList: false,
        deviceId: findSession.deviceId,
      };
      await this.tokensRepository.createToken(tokenData);
    } else {
      const newDevice = await this.devicesRepository.createSession(deviceData);
      const tokenData = {
        userId: findedUser.id,
        refreshToken,
        blackList: false,
        deviceId: deviceData.deviceId,
      };
      await this.tokensRepository.createToken(tokenData);
    }
    return {
      accessToken,
      refreshToken,
    };
  }
}
