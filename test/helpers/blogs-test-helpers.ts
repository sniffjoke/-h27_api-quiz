import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../src/core/settings/env/configuration';
import { BlogCreateModel } from '../../src/features/blogs/api/models/input/create-blog.input.model';
import request from 'supertest';
import { codeAuth } from './test-helpers';

export class BlogsTestManager {
  constructor(
    protected readonly app: INestApplication,
    private configService: ConfigService<ConfigurationType, true>,
  ) {
  }

  async createBlog(createModel: BlogCreateModel) {
    const apiSettings = this.configService.get('apiSettings', { infer: true });
    const response = await request(this.app.getHttpServer())
      .post('/sa/blogs')
      .send(createModel)
      .set({ 'Authorization': `Basic ` + codeAuth(apiSettings.ADMIN) });
    return response;
  }

  async createBlogWOAuth(createModel: BlogCreateModel) {
    const response = await request(this.app.getHttpServer())
      .post('/sa/blogs')
      .send(createModel);
    return response;
  }

  async updateBlog(updModel: BlogCreateModel, blogId: string) {
    const apiSettings = this.configService.get('apiSettings', { infer: true });
    const response = await request(this.app.getHttpServer())
      .put('/sa/blogs/' + `${blogId}`)
      .send(updModel)
      .set({ 'Authorization': `Basic ` + codeAuth(apiSettings.ADMIN) });
    return response;
  }

  async getBlogs() {
    const response = await request(this.app.getHttpServer())
      .get('/blogs/');
    return response;
  }

  async getBlogsWithSA() {
    const apiSettings = this.configService.get('apiSettings', { infer: true });
    const response = await request(this.app.getHttpServer())
      .get('/sa/blogs/')
      .set({ 'Authorization': `Basic ` + codeAuth(apiSettings.ADMIN) });
    return response;
  }

  async getBlogById(blogId: string) {
    const response = await request(this.app.getHttpServer())
      .get('/blogs/' + `${blogId}`);
    return response;
  }

  async deleteBlog(blogId: string) {
    const apiSettings = this.configService.get('apiSettings', { infer: true });
    const response = await request(this.app.getHttpServer())
      .delete('/sa/blogs/' + `${blogId}`)
      .set({ 'Authorization': `Basic ` + codeAuth(apiSettings.ADMIN) })
      .expect(204);
    return response;
  }

}

export const createMockBlog = (uniqueIndex: number) => ({
  name: 'name' + `${uniqueIndex}`,
  description: 'description' + `${uniqueIndex}`,
  websiteUrl: 'http://some-' + `${uniqueIndex}` + '-url.com',
});
