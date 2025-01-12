import { Body, Controller, Get, HttpCode, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { PostsService } from '../application/posts.service';
import { CommentCreateModel } from '../../comments/api/models/input/create-comment.input.model';
import { CommentsService } from '../../comments/application/comments.service';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { LikeHandler } from '../../likes/domain/like.handler';
import { CreateLikeInput } from '../../likes/api/models/input/create-like.input.model';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCommentCommand } from '../../comments/application/useCases/create-comment.use-case';
import { CommentsQueryRepositoryTO } from '../../comments/infrastructure/comments.query-repository.to';
import { UsersService } from '../../users/application/users.service';
import { PostsQueryRepositoryTO } from '../infrastructure/posts.query-repository.to';

@Controller()
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepositoryTO,
    private readonly commentsService: CommentsService,
    private readonly commentsQueryRepository: CommentsQueryRepositoryTO,
    private readonly likeHandler: LikeHandler,
    private readonly commandBus: CommandBus,
    private readonly usersService: UsersService,
  ) {

  }

  @Get('posts')
  async getAllPosts(@Query() query: any, @Req() req: Request) {
    const posts = await this.postsQueryRepository.getAllPostsWithQuery(query);
    const newData = await this.postsService.generatePostsWithLikesDetails(posts.items, req.headers.authorization as string);
    return {
      ...posts,
      items: newData,
    };
  }

  @Get('posts/:id')
  async getPostById(@Param('id') id: string, @Req() req: Request) {
    const post = await this.postsQueryRepository.postOutput(id);
    const postWithDetails = await this.postsService.generateOnePostWithLikesDetails(post, req.headers.authorization as string);
    return postWithDetails;
  }

  // @Post('sa/posts')
  // @UseGuards(BasicAuthGuard)
  // async createPost(@Body() models: PostCreateModel, @Req() req: Request) {
  //   const postId = await this.commandBus.execute(new CreatePostCommand(models));
  //   const newPost = await this.postsQueryRepository.postOutput(postId);
  //   const postWithDetails = await this.postsService.generateOnePostWithLikesDetails(newPost, req.headers.authorization as string)
  //   return newPost;
  // }

  @Post('posts/:id/comments')
  @UseGuards(JwtAuthGuard)
  async createComment(@Body() dto: CommentCreateModel, @Param('id') postId: string, @Req() req: Request) {
    const commentId = await this.commandBus.execute(new CreateCommentCommand(dto, postId, req.headers.authorization as string));
    const newComment = await this.commentsQueryRepository.commentOutput(commentId);
    const newCommentData = this.commentsService.addStatusPayload(newComment);
    return newCommentData;
  }

  @Get('posts/:id/comments')
  async getAllCommentsByPostId(@Param('id') id: string, @Query() query: any, @Req() req: Request) {
    const comments = await this.commentsQueryRepository.getAllCommentByPostIdWithQuery(query, id);
    const commentsMap = await this.commentsService.generateCommentsData(comments.items, req.headers.authorization as string);
    return {
      ...comments,
      items: commentsMap,
    };
  }

  @Put('posts/:id/like-status')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async updatePostByIdWithLikeStatus(@Body() like: CreateLikeInput, @Param('id') postId: string, @Req() req: Request) {
    const {
      findedPost,
      user,
    } = await this.postsService.updatePostByIdWithLikeStatus(req.headers.authorization as string, postId);
    return await this.likeHandler.postHandler(like.likeStatus, findedPost, user);
  }

}
