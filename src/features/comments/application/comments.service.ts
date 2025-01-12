import { Injectable} from '@nestjs/common';
import { TokensService } from '../../tokens/application/tokens.service';
import { CommentViewModel } from '../api/models/output/comment.view.model';
import { LikeStatus } from '../../posts/api/models/output/post.view.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UsersRepositoryTO } from '../../users/infrastructure/users.repository.to';
import { CommentsRepositoryTO } from '../infrastructure/comments.repository.to';

@Injectable()
export class CommentsService {
  constructor(
    private readonly tokensService: TokensService,
    private readonly usersRepository: UsersRepositoryTO,
    private readonly commentsRepository: CommentsRepositoryTO,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
  }

  async updateCommentByIdWithLikeStatus(bearerHeader: string, commentId: string) {
    const token = this.tokensService.getToken(bearerHeader);
    const decodedToken: any = this.tokensService.validateAccessToken(token);
    const user = await this.usersRepository.findUserById(decodedToken?._id);
    const findedComment = await this.commentsRepository.findCommentById(commentId);
    return {
      findedComment,
      user,
    };
  }

  async generateCommentsData(items: CommentViewModel[], bearerHeader: string) {
    const commentsMap = await Promise.all(items.map(async (item) => {
        return this.generateNewCommentData(item, bearerHeader);
      }),
    );
    return commentsMap;
  }

  async generateNewCommentData(item: any, bearerHeader: string) {
    let user;
    if (bearerHeader) {
      try {
        const token = this.tokensService.getToken(bearerHeader);
        const decodedToken = this.tokensService.decodeToken(token);
        user = await this.usersRepository.findUserByIdOrNull(decodedToken._id);
      } catch {
        user = null;
      }
    } else {
      user = null;
    }
    const likeStatus = await this.dataSource.query(
      `
            SELECT "status"
            FROM likes
            WHERE "commentId" = $1 AND "userId" = $2  
      `,
      [item.id, user?.id],
    );
    const myStatus = user && likeStatus.length ? likeStatus[0].status : LikeStatus.None;
    const newCommentData = this.addStatusPayload(item, myStatus);
    return newCommentData;
  }

  addStatusPayload(comment: CommentViewModel, status?: string) {
    const newStatus = status ? status : LikeStatus.None;
    return {
      ...comment,
      likesInfo: {
        ...comment.likesInfo,
        myStatus: newStatus,
      },
    };
  }

}
