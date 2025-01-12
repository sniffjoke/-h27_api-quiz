import { Injectable } from '@nestjs/common';
import { PostCreateModel } from '../api/models/input/create-post.input.model';
import { TokensService } from '../../tokens/application/tokens.service';
import { LikeStatus } from '../api/models/output/post.view.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostsRepositoryTO } from '../infrastructure/posts.repository.to';
import { UsersRepositoryTO } from '../../users/infrastructure/users.repository.to';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepositoryTO,
    private readonly tokensService: TokensService,
    private readonly usersRepository: UsersRepositoryTO,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
  }

  async updatePostByIdWithLikeStatus(bearerHeader: string, postId: string) {
    const token = this.tokensService.getToken(bearerHeader);
    const decodedToken: any = this.tokensService.decodeToken(token);
    const user = await this.usersRepository.findUserById(decodedToken?._id);
    const findedPost = await this.postsRepository.findPostById(postId);
    return {
      findedPost,
      user,
    };
  }

  async generatePostsWithLikesDetails(items: PostCreateModel[], bearerToken: string) {
    const newItems = await Promise.all(
      items.map(async (item) => {
          return this.generateOnePostWithLikesDetails(item, bearerToken);
        },
      ),
    );
    return newItems;
  }

  async generateOnePostWithLikesDetails(post: any, bearerHeader: string) {
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
            SELECT *
            FROM likes
            WHERE "postId" = $1 AND "userId" = $2  
      `,
      [post.id, user?.id],
    );
    const likeDetails = await this.dataSource.query(
      `
                    SELECT *
                    FROM likes
                    WHERE "postId" = $1 AND "status" = $2
                    ORDER BY "addedAt" DESC
                    LIMIT 3
                              
          `,
      [post.id, LikeStatus.Like],
    );
    const likeDetailsMap = await Promise.all(
      likeDetails.map(async (like: any) => {
        const user = await this.usersRepository.findUserById(like.userId);
        return {
          addedAt: like.addedAt,
          userId: like.userId.toString(),
          login: user.login,
        };
      }),
    );
    const myStatus = user && likeStatus.length ? likeStatus[0].status : LikeStatus.None;
    const postDataWithInfo = this.statusAndNewLikesPayload(post, myStatus, likeDetailsMap);
    return postDataWithInfo;
  }

  statusAndNewLikesPayload(post: any, status?: string, newestLikes?: any) {
    const curStatus = status ? status : LikeStatus.None;
    const newLikes = newestLikes ? newestLikes : [];
    return {
      ...post,
      extendedLikesInfo: {
        likesCount: post.extendedLikesInfo.likesCount,
        dislikesCount: post.extendedLikesInfo.dislikesCount,
        myStatus: curStatus,
        newestLikes: newLikes,
      },
    };
  }

}

// async updatePost(id: string, models: PostCreateModel) {
// const post = await this.postModel.findOne({_id: id})
// if (!post) {
//     throw new NotFoundException(`Post with id ${id} not found`)
// }
// const updatePost = await this.postsRepository.updatePost(post.id, models)
// return updatePost
// }

// async deletePost(id: string) {
// const findedPost = await this.postModel.findById(id)
// if (!findedPost) {
//     throw new NotFoundException(`Post with id ${id} not found`)
// }
// const deletePost = await this.postModel.deleteOne({_id: id})
// return deletePost
// }
