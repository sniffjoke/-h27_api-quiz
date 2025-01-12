import { Injectable } from '@nestjs/common';
import { LikeStatus } from '../../posts/api/models/output/post.view.model';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { LikeEntity } from './likes.entity';


@Injectable()
export class LikeHandler {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(LikeEntity) private readonly lRepository: Repository<LikeEntity>,
  ) {
  }

  async postHandler(likeStatus: LikeStatus, post: any, user: any) {
    const isLikeObjectForCurrentUserExists: any | null = await this
      .lRepository.findOne({
        where: { userId: user.id, postId: post.id },
      });
    if (!isLikeObjectForCurrentUserExists) {
      const newLike = await this.lRepository.insert({
        status: LikeStatus.None,
        userId: user.id,
        postId: post.id,
      });
    }
    const findedLike = await this
      .lRepository.findOne({
        where: { userId: user.id, postId: post.id },
        relations: ['post.extendedLikesInfo'],
      });
    // Пессимистическая блокировка
    if (findedLike) {
      console.log('statusBefore: ', findedLike.status);
      if (findedLike.status === likeStatus) {
        const updateLikeStatus = null;
      } else {
        if (likeStatus === LikeStatus.Like) {
          if (findedLike.post.extendedLikesInfo.dislikesCount > 0 && findedLike.status === LikeStatus.Dislike) {
            findedLike.post.extendedLikesInfo.likesCount++;
            findedLike.post.extendedLikesInfo.dislikesCount--;
            const updatePostInfo = await this.lRepository.manager.save(findedLike.post.extendedLikesInfo);
            findedLike.status = likeStatus;
            const updateLikeStatus = await this.lRepository.save(findedLike);
          } else {
            findedLike.post.extendedLikesInfo.likesCount++;
            const updatePostInfo = await this.lRepository.manager.save(findedLike.post.extendedLikesInfo);
            findedLike.status = likeStatus;
            const updateLikeStatus = await this.lRepository.save(findedLike);
          }
        }
        if (likeStatus === LikeStatus.Dislike) {
          if (findedLike.post.extendedLikesInfo.likesCount > 0 && findedLike.status === LikeStatus.Like) {
            findedLike.post.extendedLikesInfo.likesCount--;
            findedLike.post.extendedLikesInfo.dislikesCount++;
            const updatePostInfo = await this.lRepository.manager.save(findedLike.post.extendedLikesInfo);
            findedLike.status = likeStatus;
            const updateLikeStatus = await this.lRepository.save(findedLike);
          } else {
            findedLike.post.extendedLikesInfo.dislikesCount++;
            const updatePostInfo = await this.lRepository.manager.save(findedLike.post.extendedLikesInfo);
            findedLike.status = likeStatus;
            const updateLikeStatus = await this.lRepository.save(findedLike);
          }
        }

        if (likeStatus === LikeStatus.None) {
          if (findedLike.status === LikeStatus.Like) {
            findedLike.post.extendedLikesInfo.likesCount--;
            const updatePostInfo = await this.lRepository.manager.save(findedLike.post.extendedLikesInfo);
            findedLike.status = likeStatus;
            const updateLikeStatus = await this.lRepository.save(findedLike);
          } else {
            findedLike.post.extendedLikesInfo.dislikesCount--;
            const updatePostInfo = await this.lRepository.manager.save(findedLike.post.extendedLikesInfo);
            findedLike.status = likeStatus;
            const updateLikeStatus = await this.lRepository.save(findedLike);
          }
        }
      }
    }
  }

  async commentHandler(likeStatus: LikeStatus, comment: any, user: any) {
    const isLikeObjectForCurrentUserExists: any | null = await this
      .lRepository.findOne({
        where: { userId: user.id, commentId: comment.id },
      });

    if (!isLikeObjectForCurrentUserExists) {
      const newLike = await this.lRepository.insert({
        status: LikeStatus.None,
        userId: user.id,
        commentId: comment.id,
      });
    }
    const findedLike = await this
      .lRepository.findOne({
        where: { userId: user.id, commentId: comment.id },
        relations: ['comment.likesInfo'],
      });
    if (findedLike) {
      if (findedLike.status === likeStatus) {
        const updateLikeStatus = null;
      } else {
        if (likeStatus === LikeStatus.Like) {
          if (findedLike.comment.likesInfo.dislikesCount > 0 && findedLike.status === LikeStatus.Dislike) {
            findedLike.comment.likesInfo.likesCount++;
            findedLike.comment.likesInfo.dislikesCount--;
            const updatePostInfo = await this.lRepository.manager.save(findedLike.comment.likesInfo);
            findedLike.status = likeStatus;
            const updateLikeStatus = await this.lRepository.manager.save(findedLike);
          } else {
            findedLike.comment.likesInfo.likesCount++;
            const updatePostInfo = await this.lRepository.manager.save(findedLike.comment.likesInfo);
            findedLike.status = likeStatus;
            const updateLikeStatus = await this.lRepository.manager.save(findedLike);
          }
        }
        if (likeStatus === LikeStatus.Dislike) {
          if (findedLike.comment.likesInfo.likesCount > 0 && findedLike.status === LikeStatus.Like) {
            findedLike.comment.likesInfo.likesCount--;
            findedLike.comment.likesInfo.dislikesCount++;
            const updatePostInfo = await this.lRepository.manager.save(findedLike.comment.likesInfo);
            findedLike.status = likeStatus;
            const updateLikeStatus = await this.lRepository.manager.save(findedLike);
          } else {
            findedLike.comment.likesInfo.dislikesCount++;
            const updatePostInfo = await this.lRepository.manager.save(findedLike.comment.likesInfo);
            findedLike.status = likeStatus;
            const updateLikeStatus = await this.lRepository.manager.save(findedLike);
          }
        }
        if (likeStatus === LikeStatus.None) {
          if (findedLike.status === LikeStatus.Like) {
            findedLike.comment.likesInfo.likesCount--;
            const updatePostInfo = await this.lRepository.manager.save(findedLike.comment.likesInfo);
            findedLike.status = likeStatus;
            const updateLikeStatus = await this.lRepository.manager.save(findedLike);
          } else {
            findedLike.comment.likesInfo.dislikesCount--;
            const updatePostInfo = await this.lRepository.manager.save(findedLike.comment.likesInfo);
            findedLike.status = likeStatus;
            const updateLikeStatus = await this.lRepository.manager.save(findedLike);
          }
        }
      }
    }
  }

}
