import { Body, Controller, Delete, Get, HttpCode, Param, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { CommentsService } from '../application/comments.service';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { CommentCreateModel } from './models/input/create-comment.input.model';
import { LikeHandler } from '../../likes/domain/like.handler';
import { CreateLikeInput } from '../../likes/api/models/input/create-like.input.model';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from '../application/useCases/update-comment.use-case';
import { DeleteCommentCommand } from '../application/useCases/delete-comment.use-case';
import { CommentsQueryRepositoryTO } from '../infrastructure/comments.query-repository.to';
import { CommentsRepositoryTO } from '../infrastructure/comments.repository.to';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentsRepository: CommentsRepositoryTO,
    private readonly commentsQueryRepository: CommentsQueryRepositoryTO,
    private readonly likeHandler: LikeHandler,
    private readonly commandBus: CommandBus
  ) {

  }

  @Get(':id')
  async getCommentById(@Param('id') id: string, @Req() req: Request) {
    const comment = await this.commentsRepository.findCommentById(id);
    const commentViewData = this.commentsQueryRepository.commentOutputMap(comment, comment.user);
    const commentDataWithLike = await this.commentsService.generateNewCommentData(commentViewData, req.headers.authorization as string);
    return commentDataWithLike;
  }


  @Put(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async updateCommentById(@Body() dto: CommentCreateModel, @Param('id') id: string, @Req() req: Request) {
    return await this.commandBus.execute(new UpdateCommentCommand(dto, id, req.headers.authorization as string));
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async deleteCommentById(@Param('id') id: string, @Req() req: Request) {
   return await this.commandBus.execute(new DeleteCommentCommand(id, req.headers.authorization as string))
  }

  @Put(':id/like-status')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async updatePostByIdWithLikeStatus(@Body() like: CreateLikeInput, @Param('id') commentId: string, @Req() req: Request) {
    const {
      findedComment,
      user,
    } = await this.commentsService.updateCommentByIdWithLikeStatus(req.headers.authorization as string, commentId);
    return await this.likeHandler.commentHandler(like.likeStatus, findedComment!, user!);
  }

}
