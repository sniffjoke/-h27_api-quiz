import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../src/core/settings/env/configuration';
import { PostCreateModelWithParams } from '../../src/features/posts/api/models/input/create-post.input.model';
import request from 'supertest';
import { codeAuth } from './test-helpers';

export class PostsTestManager {
  constructor(
    protected readonly app: INestApplication,
    private configService: ConfigService<ConfigurationType, true>,
  ) {
  }

  async createPost(createModel: PostCreateModelWithParams, blogId: string) {
    const apiSettings = this.configService.get('apiSettings', { infer: true });
    const response = await request(this.app.getHttpServer())
      .post(`/sa/blogs/${blogId}/posts`)
      .send(createModel)
      .set({ 'Authorization': `Basic ` + codeAuth(apiSettings.ADMIN) });
    return response;
  }

  async getPostsWithSA(blogId: string) {
    const apiSettings = this.configService.get('apiSettings', { infer: true });
    const response = await request(this.app.getHttpServer())
      .get(`/sa/blogs/${blogId}/posts`)
      .set({ 'Authorization': `Basic ` + codeAuth(apiSettings.ADMIN) });
    return response;
  }

  async updatePost(updModel: PostCreateModelWithParams, blogId: string, postId: string) {
    const apiSettings = this.configService.get('apiSettings', { infer: true });
    const response = await request(this.app.getHttpServer())
      .put('/sa/blogs/' + `${blogId}` + '/posts/' + `${postId}`)
      .send(updModel)
      .set({ 'Authorization': `Basic ` + codeAuth(apiSettings.ADMIN) })
    return response
  }

  async updatePostByLike(likeStatus: string, postId: string, accessToken: string) {
    const response = await request(this.app.getHttpServer())
      .put(`/posts/${postId}/like-status`)
      .set({ 'Authorization': 'Bearer ' +  accessToken})
      .send({likeStatus})
    return response;
  }

  async getPostById(postId: string) {
    const response = await request(this.app.getHttpServer())
      .get('/posts/' + `${postId}`)
    return response
  }

  async deletePost(postId: string, blogId: string) {
    const apiSettings = this.configService.get('apiSettings', { infer: true });
    const response = await request(this.app.getHttpServer())
      .delete('/sa/blogs/' + `${blogId}` + '/posts/' + `${postId}`)
      .set({ 'Authorization': `Basic ` + codeAuth(apiSettings.ADMIN) })
    return response
  }

  async getPosts() {
    const response = await request(this.app.getHttpServer())
      .get('/posts')
    return response
  }

  async createPostWOAuth(createModel: PostCreateModelWithParams, blogId: string) {
    const response = await request(this.app.getHttpServer())
      .post('/sa/blogs/' + `${blogId}` + '/posts')
      .send(createModel)
    return response
  }

}

export const createMockPost = (uniqueIndex: number) => ({
  title: 'title' + `${uniqueIndex}`,
  shortDescription: 'shortDescription' + `${uniqueIndex}`,
  content: 'content' + `${uniqueIndex}`,
});
