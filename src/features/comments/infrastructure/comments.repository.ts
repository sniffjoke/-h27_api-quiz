import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentCreateModel } from '../api/models/input/create-comment.input.model';


@Injectable()
export class CommentsRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
  }

  async createComment(comment: CommentCreateModel, userId: number, postId: string) {
    const newComment = await this.dataSource.query(
      `
                    INSERT INTO comments (
                      "content", 
                      "postId" ,
                      "userId"
                      )
                    VALUES ($1, $2, $3)
                    RETURNING *
          `,
      [
        comment.content,
        postId,
        userId
      ],
    );
    const newCommentLikesInfo = await this.dataSource.query(
      `
                INSERT INTO "likesInfo" ("commentId")
                VALUES ($1)
      `,
      [newComment[0].id]
    )
    return newComment[0].id;
  }

  async findCommentById(id: string) {
    const findedComment = await this.dataSource.query(
      `
                    SELECT c.*, i.*, l.*
                    FROM comments c
                    INNER JOIN "commentatorInfo" i ON c."id" = i."commentId"
                    INNER JOIN "likesInfo" l ON c."id" = l."commentId"
                    WHERE "id" = $1          
          `,
      [id],
    );
    if (!findedComment.length) {
      throw new NotFoundException(`Could not find comment with id ${id}`);
    }
    return findedComment[0];
  }

  async updateComment(commentId: string, dto: CommentCreateModel) {
    const updateComment = await this.dataSource.query(
      `
                    UPDATE comments
                    SET "content" = $1
                    WHERE "id" = $2          
          `,
      [
        dto.content,
        commentId
      ],
    );
    return updateComment;
  }

  async deleteComment(commentId: string) {
    const deleteComment = await this.dataSource.query(
      `
                    DELETE FROM comments
                    WHERE "id" = $1
                `,
      [commentId],
    );
    return deleteComment;
  }

}
