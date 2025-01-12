import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TokensService } from '../../../tokens/application/tokens.service';
import { CommentCreateModel } from '../../api/models/input/create-comment.input.model';
import { UsersCheckHandler } from '../../../users/domain/users.check-handler';
import { CommentsRepositoryTO } from '../../infrastructure/comments.repository.to';

export class UpdateCommentCommand {
  constructor(
    public commentDto: CommentCreateModel,
    public id: string,
    public bearerHeader: string
  ) {
  }

}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand> {
  constructor(
    private readonly tokensService: TokensService,
    private readonly commentsRepository: CommentsRepositoryTO,
    private readonly usersCheckHandler: UsersCheckHandler
  ) {
  }

  async execute(command: UpdateCommentCommand) {
    const token = this.tokensService.getToken(command.bearerHeader);
    const decodedToken = this.tokensService.decodeToken(token);
    const findedComment = await this.commentsRepository.findCommentById(command.id);
    const isOwner = this.usersCheckHandler.checkIsOwner(Number(findedComment.userId), decodedToken._id);
    if (isOwner) {
      const updateComment = await this.commentsRepository.updateComment(command.id, command.commentDto);
      return updateComment;
    }
  }
}
