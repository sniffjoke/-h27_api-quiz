import { forwardRef, Module } from '@nestjs/common';
import { CommentsController } from './api/comments.controller';
import { CommentsService } from './application/comments.service';
import { CommentsRepository } from './infrastructure/comments.repository';
import { CommentsQueryRepository } from './infrastructure/comments.query-repository';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';
import { TokensService } from '../tokens/application/tokens.service';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { UsersCheckHandler } from '../users/domain/users.check-handler';
import { LikeHandler } from '../likes/domain/like.handler';
import { LikesModule } from '../likes/likes.module';
import { CommentsCommandHandlers } from './application/useCases';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './domain/comment.entity';
import { LikesInfoEntity } from './domain/likes-info.entity';
import { CommentsRepositoryTO } from './infrastructure/comments.repository.to';
import { CommentsQueryRepositoryTO } from './infrastructure/comments.query-repository.to';
import { PostEntity } from '../posts/domain/posts.entity';
import { LikeEntity } from '../likes/domain/likes.entity';
import { UsersRepositoryTO } from '../users/infrastructure/users.repository.to';
import { UserEntity } from '../users/domain/user.entity';
import { EmailConfirmationEntity } from '../users/domain/email-confirmation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommentEntity,
      LikesInfoEntity,
      PostEntity,
      LikeEntity,
      UserEntity,
      EmailConfirmationEntity
    ]),
    forwardRef(() => PostsModule),
    UsersModule,
    LikesModule,
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    CommentsRepositoryTO,
    CommentsQueryRepositoryTO,
    TokensService,
    UsersRepositoryTO,
    UsersCheckHandler,
    LikeHandler,
    ...CommentsCommandHandlers,
  ],
  exports: [
    CommentsService,
    CommentsRepositoryTO,
    CommentsQueryRepositoryTO,
    ...CommentsCommandHandlers,
  ],
})
export class CommentsModule {
}
