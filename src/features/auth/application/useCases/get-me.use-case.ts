import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TokensService } from '../../../tokens/application/tokens.service';
import { UnauthorizedException } from '@nestjs/common';
import { UsersRepositoryTO } from '../../../users/infrastructure/users.repository.to';

export class GetMeCommand {
  constructor(
    public bearerHeader: string,
  ) {
  }

}

@CommandHandler(GetMeCommand)
export class GetMeUseCase
  implements ICommandHandler<GetMeCommand> {
  constructor(
    private readonly usersRepository: UsersRepositoryTO,
    private readonly tokensService: TokensService,
  ) {

  }

  async execute(command: GetMeCommand) {
    const token = this.tokensService.getToken(command.bearerHeader);
    const validateToken = this.tokensService.validateAccessToken(token);
    if (!validateToken) {
      throw new UnauthorizedException('Invalid access token');
    }
    const findedUser = await this.usersRepository.findUserById(validateToken._id);
    if (!findedUser) {
      throw new UnauthorizedException('User not exists');
    }
    return {
      email: findedUser.email,
      login: findedUser.login,
      userId: `${findedUser.id}`,
    };
  }
}
