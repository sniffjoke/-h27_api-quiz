import { CreateCommentUseCase } from './create-comment.use-case';
import { UpdateCommentUseCase } from './update-comment.use-case';
import { DeleteCommentUseCase } from './delete-comment.use-case';

export const CommentsCommandHandlers = [
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase
];
