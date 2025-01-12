import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepositoryTO } from '../../infrastructure/users.repository.to';

export class ActivateEmailCommand {
  constructor(
    public code: string,
  ) {
  }

}

@CommandHandler(ActivateEmailCommand)
export class ActivateEmailUseCase
  implements ICommandHandler<ActivateEmailCommand> {
  constructor(
    private readonly usersRepository: UsersRepositoryTO,
  ) {

  }

  async execute(command: ActivateEmailCommand) {
    const isUserExists = await this.usersRepository.findUserByCode(command.code);
    if (isUserExists.isConfirm) {
      throw new BadRequestException('Code already activate');
    }
    const updateUserInfo = await this.usersRepository.updateUserByActivateEmail(
      isUserExists.userId,
    );
    return updateUserInfo;
  }
}
