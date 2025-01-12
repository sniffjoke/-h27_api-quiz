import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { TokensService } from '../../../tokens/application/tokens.service';
import { UsersRepositoryTO } from '../../../users/infrastructure/users.repository.to';
import { DevicesRepositoryTO } from '../../infrastructure/devices.repository.to';

export class GetDevicesCommand {
  constructor(
    public bearerHeaderR: string,
  ) {
  }

}

@CommandHandler(GetDevicesCommand)
export class GetDevicesUseCase
  implements ICommandHandler<GetDevicesCommand> {
  constructor(
    private readonly usersRepository: UsersRepositoryTO,
    private readonly tokensService: TokensService,
    private readonly devicesRepository: DevicesRepositoryTO,
  ) {

  }

  async execute(command: GetDevicesCommand) {
    const token = this.tokensService.getTokenFromCookie(command.bearerHeaderR);
    const validateToken: any = this.tokensService.validateRefreshToken(token);
    if (!validateToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.usersRepository.findUserById(validateToken._id);
    const devices = await this.devicesRepository.findDeviceByUserId({ userId: user.id });
    const deviceMap = (device: any) => ({
      deviceId: device.deviceId,
      ip: device.ip,
      title: device.title,
      lastActiveDate: device.lastActiveDate,
    });
    const devicesOutput = devices.map((device) => {
      return deviceMap(device);
    });
    return devicesOutput;
  }
}
