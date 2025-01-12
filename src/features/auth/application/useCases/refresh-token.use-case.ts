import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TokensService } from '../../../tokens/application/tokens.service';
import { UnauthorizedException } from '@nestjs/common';
import { DevicesRepositoryTO } from '../../../devices/infrastructure/devices.repository.to';
import { TokensRepositoryTO } from '../../../tokens/infrastructure/tokens.repository.to';


export class RefreshTokenCommand {
  constructor(
    public tokenHeaderR: any,
  ) {
  }

}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
  implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    private readonly tokensService: TokensService,
    private readonly tokensRepository: TokensRepositoryTO,
    private readonly devicesRepository: DevicesRepositoryTO,
  ) {

  }

  async execute(command: RefreshTokenCommand) {
    const token = this.tokensService.getTokenFromCookie(command.tokenHeaderR);
    const tokenValidate: any = this.tokensService.validateRefreshToken(token);
    if (!tokenValidate) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const isTokenExists: any = await this.tokensRepository.findTokenByRToken({ refreshToken: token });
    if (!isTokenExists || isTokenExists.blackList) {
      throw new UnauthorizedException('Refresh token not valid');
    }
    const updateTokenInfo = await this.tokensRepository.updateStatusRTokensInDb({ refreshToken: isTokenExists.refreshToken });
    if (!updateTokenInfo) {
      throw new UnauthorizedException('Something went wrong');
    }
    const { refreshToken, accessToken } = this.tokensService.createTokens(isTokenExists.userId, tokenValidate.deviceId);
    const tokenData = {
      userId: isTokenExists.userId,
      refreshToken,
      blackList: false,
      deviceId: isTokenExists.deviceId,
    };
    const addTokenToDb = await this.tokensRepository.createToken(tokenData);
    if (!addTokenToDb) {
      throw new UnauthorizedException('Unfortunate to refresh token');
    }
    const findSessionAndUpdate = await this.devicesRepository.updateDeviceByIdAndByDeviceId(
      isTokenExists.userId,
      isTokenExists.deviceId,
      new Date(Date.now()).toISOString(),
    );
    if (!findSessionAndUpdate) {
      throw new UnauthorizedException('Not updated session');
    }
    return {
      refreshToken,
      accessToken,
    };

  }
}
