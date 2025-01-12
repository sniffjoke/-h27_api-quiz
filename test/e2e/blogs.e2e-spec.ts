import { INestApplication } from '@nestjs/common';
import { checkWebsiteString } from '../helpers/test-helpers';
import { initSettings } from '../helpers/init-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { BlogsTestManager, createMockBlog } from '../helpers/blogs-test-helpers';

describe('BlogsController (e2e)', () => {
  let app: INestApplication;
  let blogsManager: BlogsTestManager;


  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;
    blogsManager = result.blogTestManager;
    // await deleteAllData(app)
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  describe('/blogs (e2e)', () => {
    it('/sa/blogs (POST)', async () => {
      const blog = await blogsManager.createBlog(createMockBlog(1));
      expect(blog.status).toBe(201);
      expect(blog.body).toHaveProperty('id');
      expect(blog.body).toHaveProperty('name');
      expect(blog.body).toHaveProperty('description');
      expect(blog.body).toHaveProperty('websiteUrl');
      expect(blog.body).toHaveProperty('createdAt');
      expect(blog.body).toHaveProperty('isMembership');
      expect(new Date(blog.body.createdAt).toISOString()).toContain('T');
      expect(blog.body.createdAt).toBeDefined();
      expect(blog.body.isMembership).toBeDefined();
      expect(blog.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          description: expect.any(String),
          websiteUrl: expect.stringMatching(checkWebsiteString),
          createdAt: expect.any(String),
          isMembership: expect.any(Boolean),
        }),
      );
    });

    it('/sa/blogs/:id (UPDATE)', async () => {
      const newBlog = await blogsManager.createBlog(createMockBlog(2));
      const upd = await blogsManager.updateBlog(createMockBlog(3), newBlog.body.id);
      const updatedBlog = await blogsManager.getBlogById(newBlog.body.id);
      expect(upd.status).toBe(204);
      expect(updatedBlog.body.id).toEqual(newBlog.body.id);
      expect(updatedBlog.body.name).not.toEqual(newBlog.body.name);
      expect(updatedBlog.body.description).not.toEqual(newBlog.body.description);
      expect(updatedBlog.body.websiteUrl).not.toEqual(newBlog.body.websiteUrl);
    });

    it('/sa/blogs/:id (DELETE)', async () => {
      const newBlog = await blogsManager.createBlog(createMockBlog(4));
      const response = await blogsManager.deleteBlog(newBlog.body.id);
      const blogs = await blogsManager.getBlogsWithSA();
      expect(response.status).toBe(204);
      // expect(blogs.body.items.length).toBeLessThan(1);
    });

    it('/blogs (GET)', async () => {
      for (let i = 5; i < 15; i++) {
        let newBlog = await blogsManager.createBlog(createMockBlog(i));
      }
      const blogs = await blogsManager.getBlogs();
      expect(blogs.status).toBe(200);
      expect(Array.isArray(blogs.body.items)).toBe(true);
      // toHaveLength
      expect(blogs.body.items.length).toBeGreaterThan(0);
      //toEqual
      blogs.body.items.forEach((blog: any) => {
        expect(blog).toHaveProperty('id');
        expect(blog).toHaveProperty('name');
        expect(blog).toHaveProperty('description');
        expect(blog).toHaveProperty('websiteUrl');
        expect(blog).toHaveProperty('createdAt');
        expect(blog).toHaveProperty('isMembership');
      });
      blogs.body.items.forEach((blog: any) => {
        expect(blog.createdAt).toBeDefined();
        expect(blog.isMembership).toBeDefined();
        // regular
        expect(new Date(blog.createdAt).toISOString()).toContain('T');
      });
      expect(blogs.body.items[0]).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          description: expect.any(String),
          // regular to constant
          websiteUrl: expect.stringMatching(/^https?:\/\/[^\s$.?#].[^\s]*$/),
          createdAt: expect.any(String),
          isMembership: expect.any(Boolean),
        }),
      );
      if (blogs.body.items.length === 0) {
        expect(blogs.body.items).toEqual([]);
      }
    });

    it('/sa/blogs (GET)', async () => {
      for (let i = 16; i < 26; i++) {
        let res = await blogsManager.createBlog(createMockBlog(i));
      }
      const blogs = await blogsManager.getBlogsWithSA();
      expect(blogs.status).toBe(200);
      expect(Array.isArray(blogs.body.items)).toBe(true);
      expect(blogs.body.items.length).toBeGreaterThan(0);
      blogs.body.items.forEach((blog: any) => {
        expect(blog).toHaveProperty('id');
        expect(blog).toHaveProperty('name');
        expect(blog).toHaveProperty('description');
        expect(blog).toHaveProperty('websiteUrl');
        expect(blog).toHaveProperty('createdAt');
        expect(blog).toHaveProperty('isMembership');
      });
      blogs.body.items.forEach((blog: any) => {
        expect(typeof blog.id).toBe('string');
        expect(typeof blog.name).toBe('string');
        expect(typeof blog.description).toBe('string');
        expect(typeof blog.websiteUrl).toBe('string');
        expect(typeof blog.createdAt).toBe('string');
        expect(typeof blog.isMembership).toBe('boolean');
      });
      blogs.body.items.forEach((blog: any) => {
        expect(blog.createdAt).toBeDefined();
        expect(blog.isMembership).toBeDefined();
        expect(new Date(blog.createdAt).toISOString()).toContain('T');
      });
      expect(blogs.body.items[0]).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          description: expect.any(String),
          websiteUrl: expect.stringMatching(/^https?:\/\/[^\s$.?#].[^\s]*$/),
          createdAt: expect.any(String),
          isMembership: expect.any(Boolean),
        }),
      );
      if (blogs.body.items.length === 0) {
        expect(blogs.body.items).toEqual([]);
      } else {
        const dates = blogs.body.items.map((blog: any) => new Date(blog.createdAt));
        expect(dates).toEqual([...dates].sort((a, b) => b.getTime() - a.getTime()));
      }
    });

    it('/blogs/:id (GET)', async () => {
      const newBlog = await blogsManager.createBlog(createMockBlog(27));
      const blog = await blogsManager.getBlogById(newBlog.body.id);
      expect(blog.status).toBe(200);
      expect(blog.body).toHaveProperty('id');
      expect(blog.body).toHaveProperty('name');
      expect(blog.body).toHaveProperty('description');
      expect(blog.body).toHaveProperty('websiteUrl');
      expect(blog.body).toHaveProperty('createdAt');
      expect(blog.body).toHaveProperty('isMembership');
      expect(new Date(blog.body.createdAt).toISOString()).toContain('T');
      expect(blog.body.createdAt).toBeDefined();
      expect(blog.body.isMembership).toBeDefined();
      expect(typeof blog.body.id).toBe('string');
      expect(typeof blog.body.name).toBe('string');
      expect(typeof blog.body.description).toBe('string');
      expect(typeof blog.body.websiteUrl).toBe('string');
      expect(typeof blog.body.createdAt).toBe('string');
      expect(typeof blog.body.isMembership).toBe('boolean');
      expect(blog.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          description: expect.any(String),
          websiteUrl: expect.stringMatching(/^https?:\/\/[^\s$.?#].[^\s]*$/),
          createdAt: expect.any(String),
          isMembership: expect.any(Boolean),
        }),
      );
    });
  });

  describe('BadRequest (e2e)', () => {
    it('should return 400 if required field is missing on create blog', async () => {
      const invalidPayload = {
        name: '',
        description: 'Invalid',
        websiteUrl: 'InvalidUrl',
      };

      const response = await blogsManager.createBlog(invalidPayload);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errorsMessages');
      // toHaveLength, expect.any(Array)
      expect(Array.isArray(response.body.errorsMessages)).toBe(true);
      response.body.errorsMessages.forEach((error) => {
        expect(error).toEqual(
          expect.objectContaining({
            message: expect.any(String),
          }),
        );
      });
      response.body.errorsMessages.forEach((error: any) => {
        expect(['name', 'websiteUrl']).toContain(error.field);
      });
    });

    it('should return 400 if required field is missing on update blog', async () => {
      const newBlog = await blogsManager.createBlog(createMockBlog(28));
      const invalidPayload = {
        name: '',
        description: 'Invalid',
        websiteUrl: 'InvalidUrl',
      };
      const response = await blogsManager.updateBlog(invalidPayload, newBlog.body.id);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errorsMessages');
      expect(Array.isArray(response.body.errorsMessages)).toBe(true);
      response.body.errorsMessages.forEach((error) => {
        expect(error).toEqual(
          expect.objectContaining({
            message: expect.any(String),
          }),
        );
      });
      response.body.errorsMessages.forEach((error: any) => {
        expect(['name', 'websiteUrl']).toContain(error.field);
      });
    });
  });

  describe('NotFound (e2e)', () => {
    it('should return 404 if id field from URL not found on delete blog', async () => {
      const newBlog = await blogsManager.createBlog(createMockBlog(29));
      const response = await blogsManager.deleteBlog(newBlog.body.id);
      const findedBlog = await blogsManager.getBlogById(newBlog.body.id);
      expect(findedBlog.status).toBe(404);
      expect(findedBlog.body).toHaveProperty('statusCode', 404);
      expect(findedBlog.body).toHaveProperty('message');
    });

    it('should return 404 if id field from URL not found on update blog', async () => {
      const newBlog = await blogsManager.createBlog(createMockBlog(30));
      const deleteBlog = await blogsManager.deleteBlog(newBlog.body.id);
      const upd = await blogsManager.updateBlog(createMockBlog(31), newBlog.body.id);
      const findedBlog = await blogsManager.getBlogById(newBlog.body.id);
      expect(findedBlog.status).toBe(404);
      expect(findedBlog.body).toHaveProperty('statusCode', 404);
      expect(findedBlog.body).toHaveProperty('message');
    });
  });

  describe('AuthGuard (e2e)', () => {
    // blog must not create
    it('should return 401 when no token is provided', async () => {
      const response = await blogsManager.createBlogWOAuth(createMockBlog(32));
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    });
  });

});
