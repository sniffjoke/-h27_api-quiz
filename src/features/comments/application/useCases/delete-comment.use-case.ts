import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TokensService } from '../../../tokens/application/tokens.service';
import { UsersCheckHandler } from '../../../users/domain/users.check-handler';
import { CommentsRepositoryTO } from '../../infrastructure/comments.repository.to';

export class DeleteCommentCommand {
  constructor(
    public id: string,
    public bearerHeader: string
  ) {
  }

}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand> {
  constructor(
    private readonly tokensService: TokensService,
    private readonly commentsRepository: CommentsRepositoryTO,
    private readonly usersCheckHandler: UsersCheckHandler
  ) {
  }

  async execute(command: DeleteCommentCommand) {
    const token = this.tokensService.getToken(command.bearerHeader);
    const decodedToken = this.tokensService.decodeToken(token);
    const findedComment = await this.commentsRepository.findCommentById(command.id);
    const isOwner = this.usersCheckHandler.checkIsOwner(Number(findedComment.userId), decodedToken._id);
    if (isOwner) {
      const deleteComment = await this.commentsRepository.deleteComment(command.id);
      return deleteComment;
    }
  }
}
