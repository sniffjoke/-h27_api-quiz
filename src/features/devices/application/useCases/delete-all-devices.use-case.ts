import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { TokensService } from '../../../tokens/application/tokens.service';
import { DevicesRepositoryTO } from '../../infrastructure/devices.repository.to';
import { TokensRepositoryTO } from '../../../tokens/infrastructure/tokens.repository.to';
import { UsersRepositoryTO } from '../../../users/infrastructure/users.repository.to';

export class DeleteAllDevicesCommand {
  constructor(
    public bearerHeaderR: string,
  ) {
  }

}

@CommandHandler(DeleteAllDevicesCommand)
export class DeleteAllDevicesUseCase
  implements ICommandHandler<DeleteAllDevicesCommand> {
  constructor(
    private readonly tokensService: TokensService,
    private readonly devicesRepository: DevicesRepositoryTO,
    private readonly tokensRepository: TokensRepositoryTO,
    private readonly usersRepository: UsersRepositoryTO,
  ) {

  }

  async execute(command: DeleteAllDevicesCommand) {
    const token = this.tokensService.getTokenFromCookie(command.bearerHeaderR);
    const validateToken: any = this.tokensService.validateRefreshToken(token);
    if (!validateToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.usersRepository.findUserById(validateToken._id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.devicesRepository.deleteAllDevicesExceptCurrent({
      userId: user.id, deviceId: validateToken.deviceId,
    });
    const updateTokensInfo = await this.tokensRepository.updateStatusTokensAfterDeleteAllInDb({
      userId: validateToken._id,
      deviceId: validateToken.deviceId,
    });
    if (!updateTokensInfo) {
      throw new UnauthorizedException('Unknown Error');
    }
    return updateTokensInfo;
  }
}
