import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CommentCreateModel } from '../../src/features/comments/api/models/input/create-comment.input.model';

export class CommentsTestManager {
  constructor(
    protected readonly app: INestApplication,
  ) {
  }

  async createComment(createModel: CommentCreateModel, postId: string, accessToken: string) {
    const response = await request(this.app.getHttpServer())
      .post(`/posts/${postId}/comments`)
      .send(createModel)
      .set({ 'Authorization': 'Bearer ' +  accessToken});
    return response;
  }

  async getComments(postId: string, accessToken: string) {
    const response = await request(this.app.getHttpServer())
      .get(`/posts/${postId}/comments`)
      .set({ 'Authorization': 'Bearer ' +  accessToken});
    return response;
  }

  async getCommentById(commentId: string, accessToken: string) {
    const response = await request(this.app.getHttpServer())
      .get(`/comments/${commentId}`)
      .set({ 'Authorization': 'Bearer ' +  accessToken});
    return response;
  }

  async updateCommentById(updModel: CommentCreateModel, commentId: string, accessToken: string) {
    const response = await request(this.app.getHttpServer())
      .put(`/comments/${commentId}`)
      .set({ 'Authorization': 'Bearer ' +  accessToken})
      .send(updModel)
    return response;
  }

  async updateCommentByLike(likeStatus: string, commentId: string, accessToken: string) {
    const response = await request(this.app.getHttpServer())
      .put(`/comments/${commentId}/like-status`)
      .set({ 'Authorization': 'Bearer ' +  accessToken})
      .send({likeStatus})
    return response;
  }

  async deleteCommentById(commentId: string, accessToken: string) {
    const response = await request(this.app.getHttpServer())
      .delete(`/comments/${commentId}`)
      .set({ 'Authorization': 'Bearer ' +  accessToken})
    return response;
  }

}

export const createMockComment = (uniqueIndex: number) => ({
  content: 'comment-20y-symbols' + `${uniqueIndex}`,
});
