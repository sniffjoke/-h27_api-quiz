import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { TokensService } from '../../../tokens/application/tokens.service';
import { TokensRepositoryTO } from '../../../tokens/infrastructure/tokens.repository.to';
import { DevicesRepositoryTO } from '../../../devices/infrastructure/devices.repository.to';


export class LogoutCommand {
  constructor(
    public tokenHeaderR: any,
  ) {
  }

}

@CommandHandler(LogoutCommand)
export class LogoutUseCase
  implements ICommandHandler<LogoutCommand> {
  constructor(
    private readonly tokensService: TokensService,
    private readonly tokensRepository: TokensRepositoryTO,
    private readonly devicesRepository: DevicesRepositoryTO,
  ) {

  }

  async execute(command: LogoutCommand) {
    const token = this.tokensService.getTokenFromCookie(command.tokenHeaderR);
    const tokenValidate: any = this.tokensService.validateRefreshToken(token);
    if (!tokenValidate) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const isTokenExists: any = await this.tokensRepository.findTokenByRToken({ refreshToken: token });
    if (!isTokenExists || isTokenExists.blackList) {
      throw new UnauthorizedException('Refresh token not valid');
    }
    const updateTokenInfo = await this.tokensRepository.updateStatusTokensInDb({deviceId: tokenValidate.deviceId});
    if (!updateTokenInfo) {
      throw new UnauthorizedException('Something went wrong');
    }
    const updateDevices = await this.devicesRepository.deleteDeviceByDeviceId({ deviceId: tokenValidate.deviceId });
    if (!updateDevices) {
      throw new UnauthorizedException('Unfortunately to update devices');
    }
    return updateDevices;

  }
}
