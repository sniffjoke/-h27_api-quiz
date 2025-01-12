import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentCreateModel } from '../api/models/input/create-comment.input.model';
import { CommentEntity } from '../domain/comment.entity';
import { LikesInfoEntity } from '../domain/likes-info.entity';


@Injectable()
export class CommentsRepositoryTO {
  constructor(
    @InjectRepository(CommentEntity) private readonly cRepository: Repository<CommentEntity>
  ) {
  }

  async createComment(commentData: CommentCreateModel, userId: string, postId: string) {
    const comment = new CommentEntity();
    comment.content = commentData.content;
    comment.postId = postId;
    comment.userId = userId;
    const newComment = await this.cRepository.save(comment);

    const likesInfo = new LikesInfoEntity();
    likesInfo.commentId = newComment.id;

    likesInfo.comment = comment;

    await this.cRepository.manager.save(likesInfo);

    return newComment.id;
  }

  async findCommentById(id: string) {
    const findedComment = await this.cRepository.findOne({
        where: { id },
      relations: ['user', 'likesInfo']
      },
    );
    if (!findedComment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }
    return findedComment;
  }

  async updateComment(commentId: string, newCommentData: Partial<CommentCreateModel>) {
    const findedComment = await this.findCommentById(commentId);
    Object.assign(findedComment, newCommentData);
    return await this.cRepository.save(findedComment);
  }

  async deleteComment(commentId: string) {
    const findedComment = await this.findCommentById(commentId);
    const deleteComment = await this.cRepository.delete(
      { id: commentId },
    );
    return deleteComment;
  }

}
