import { INestApplication } from '@nestjs/common';
import { initSettings } from '../helpers/init-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { createMockPost, PostsTestManager } from '../helpers/posts-test-helpers';
import { BlogsTestManager, createMockBlog } from '../helpers/blogs-test-helpers';
import { createMockUser, UsersTestManager } from '../helpers/users-test-helpers';
import { AuthTestManager, mockLoginData } from '../helpers/auth-test-helpers';
import { UsersService } from '../../src/features/users/application/users.service';

describe('PostsController (e2e)', () => {
  let app: INestApplication;
  let postsManager: PostsTestManager;
  let blogsManager: BlogsTestManager;
  let usersManager: UsersTestManager;
  let authManager: AuthTestManager;
  let usersService: UsersService;


  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;
    blogsManager = result.blogTestManager;
    postsManager = result.postTestManager;
    usersManager = result.userTestManager;
    authManager = result.authTestManager;
    usersService = result.usersService;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  describe('/posts (e2e)', () => {
    it('/posts/ (GET)', async () => {
      const blog = await blogsManager.createBlog(createMockBlog(40));
      for (let i = 20; i < 30; i++) {
        let res = await postsManager.createPost(createMockPost(i), blog.body.id);
      }
      const posts = await postsManager.getPosts();
      expect(posts.status).toBe(200);
      expect(Array.isArray(posts.body.items)).toBe(true);
      expect(posts.body.items.length).toBeGreaterThan(0);
      posts.body.items.forEach((post: any) => {
        expect(post).toHaveProperty('id');
        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('shortDescription');
        expect(post).toHaveProperty('content');
        expect(post).toHaveProperty('blogId');
        expect(post).toHaveProperty('blogName');
        expect(post).toHaveProperty('createdAt');
        expect(post).toHaveProperty('extendedLikesInfo');
        expect(post.extendedLikesInfo).toHaveProperty('likesCount');
        expect(post.extendedLikesInfo).toHaveProperty('dislikesCount');
        expect(post.extendedLikesInfo).toHaveProperty('myStatus');
        expect(post.extendedLikesInfo).toHaveProperty('newestLikes');
      });
      posts.body.items.forEach((blog: any) => {
        expect(blog.createdAt).toBeDefined();
        expect(blog.extendedLikesInfo).toBeDefined();
        expect(new Date(blog.createdAt).toISOString()).toContain('T');
      });
      expect(posts.body.items[0]).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
          shortDescription: expect.any(String),
          blogId: expect.any(String),
          blogName: expect.any(String),
          createdAt: expect.any(String),
          extendedLikesInfo: expect.any(Object),
        }),
      );
      expect(posts.body.items[0].extendedLikesInfo).toEqual(
        expect.objectContaining({
          likesCount: expect.any(Number),
          dislikesCount: expect.any(Number),
          myStatus: expect.any(String),
          newestLikes: expect.any(Array),
        }),
      );
      if (posts.body.items.length === 0) {
        expect(posts.body.items).toEqual([]);
      } else {
        const dates = posts.body.items.map((post: any) => new Date(post.createdAt));
        expect(dates).toEqual([...dates].sort((a, b) => b.getTime() - a.getTime()));
      }
    });

    it('/posts/:id (GET)', async () => {
      const blog = await blogsManager.createBlog(createMockBlog(36));
      const post = await postsManager.createPost(createMockPost(16), blog.body.id);
      const responce = await postsManager.getPostById(post.body.id);
      expect(responce.status).toBe(200);
      expect(responce.body).toHaveProperty('id');
      expect(responce.body).toHaveProperty('title');
      expect(responce.body).toHaveProperty('shortDescription');
      expect(responce.body).toHaveProperty('content');
      expect(responce.body).toHaveProperty('blogId');
      expect(responce.body).toHaveProperty('blogName');
      expect(responce.body).toHaveProperty('createdAt');
      expect(responce.body).toHaveProperty('extendedLikesInfo');
      expect(responce.body.extendedLikesInfo).toBeDefined();
      expect(responce.body.extendedLikesInfo).toHaveProperty('likesCount');
      expect(responce.body.extendedLikesInfo).toHaveProperty('dislikesCount');
      expect(new Date(responce.body.createdAt).toISOString()).toContain('T');
      expect(responce.body.createdAt).toBeDefined();
      expect(responce.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
          shortDescription: expect.any(String),
          blogId: expect.any(String),
          blogName: expect.any(String),
          createdAt: expect.any(String),
          extendedLikesInfo: expect.any(Object),
        }),
      );
      expect(responce.body.extendedLikesInfo).toEqual(
        expect.objectContaining({
          likesCount: expect.any(Number),
          dislikesCount: expect.any(Number),
        }),
      );
    });

    it('/sa/blogs/blogId/posts (POST)', async () => {
      const blog = await blogsManager.createBlog(createMockBlog(33));
      const post = await postsManager.createPost(createMockPost(1), blog.body.id);
      expect(post.status).toBe(201);
      expect(post.body).toHaveProperty('id');
      expect(post.body).toHaveProperty('title');
      expect(post.body).toHaveProperty('shortDescription');
      expect(post.body).toHaveProperty('content');
      expect(post.body).toHaveProperty('blogId');
      expect(post.body).toHaveProperty('blogName');
      expect(post.body).toHaveProperty('createdAt');
      expect(post.body).toHaveProperty('extendedLikesInfo');
      expect(post.body.extendedLikesInfo).toBeDefined();
      expect(post.body.extendedLikesInfo).toHaveProperty('likesCount');
      expect(post.body.extendedLikesInfo).toHaveProperty('dislikesCount');
      // expect(post.body.extendedLikesInfo).toHaveProperty('myStatus');
      // expect(post.body.extendedLikesInfo).toHaveProperty('newestLikes');
      expect(new Date(post.body.createdAt).toISOString()).toContain('T');
      expect(post.body.createdAt).toBeDefined();
      expect(post.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
          shortDescription: expect.any(String),
          blogId: expect.any(String),
          blogName: expect.any(String),
          createdAt: expect.any(String),
          extendedLikesInfo: expect.any(Object),
        }),
      );
      expect(post.body.extendedLikesInfo).toEqual(
        expect.objectContaining({
          likesCount: expect.any(Number),
          dislikesCount: expect.any(Number),
          // myStatus: expect.any(String),
          // newestLikes: expect.any(Array),
        }),
      );
    });

    it('/sa/blogs/blogId/posts (GET)', async () => {
      const blog = await blogsManager.createBlog(createMockBlog(34));
      for (let i = 2; i < 12; i++) {
        let res = await postsManager.createPost(createMockPost(i), blog.body.id);
      }
      const posts = await postsManager.getPostsWithSA(blog.body.id);
      expect(posts.status).toBe(200);
      expect(Array.isArray(posts.body.items)).toBe(true);
      expect(posts.body.items.length).toBeGreaterThan(0);
      posts.body.items.forEach((post: any) => {
        expect(post).toHaveProperty('id');
        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('shortDescription');
        expect(post).toHaveProperty('content');
        expect(post).toHaveProperty('blogId');
        expect(post).toHaveProperty('blogName');
        expect(post).toHaveProperty('createdAt');
        expect(post).toHaveProperty('extendedLikesInfo');
        expect(post.extendedLikesInfo).toHaveProperty('likesCount');
        expect(post.extendedLikesInfo).toHaveProperty('dislikesCount');
        expect(post.extendedLikesInfo).toHaveProperty('myStatus');
        expect(post.extendedLikesInfo).toHaveProperty('newestLikes');
      });
      posts.body.items.forEach((blog: any) => {
        expect(blog.createdAt).toBeDefined();
        expect(blog.extendedLikesInfo).toBeDefined();
        expect(new Date(blog.createdAt).toISOString()).toContain('T');
      });
      expect(posts.body.items[0]).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
          shortDescription: expect.any(String),
          blogId: expect.any(String),
          blogName: expect.any(String),
          createdAt: expect.any(String),
          extendedLikesInfo: expect.any(Object),
        }),
      );
      expect(posts.body.items[0].extendedLikesInfo).toEqual(
        expect.objectContaining({
          likesCount: expect.any(Number),
          dislikesCount: expect.any(Number),
          myStatus: expect.any(String),
          newestLikes: expect.any(Array),
        }),
      );
      if (posts.body.items.length === 0) {
        expect(posts.body.items).toEqual([]);
      } else {
        const dates = posts.body.items.map((post: any) => new Date(post.createdAt));
        expect(dates).toEqual([...dates].sort((a, b) => b.getTime() - a.getTime()));
      }
    });

    it('/sa/blogs/blogId/posts/:postId (UPDATE)', async () => {
      const blog = await blogsManager.createBlog(createMockBlog(34));
      const post = await postsManager.createPost(createMockPost(14), blog.body.id);
      const upd = await postsManager.updatePost(createMockPost(15), blog.body.id, post.body.id);
      const updatedPost = await postsManager.getPostById(post.body.id);
      expect(upd.status).toBe(204);
      expect(updatedPost.body.id).toEqual(post.body.id);
      expect(updatedPost.body.title).not.toEqual(post.body.title);
      expect(updatedPost.body.shortDescription).not.toEqual(post.body.shortDescription);
      expect(updatedPost.body.content).not.toEqual(post.body.content);
    });

    it('/posts/:id/like-status (PUT)', async () => {
      const blog = await blogsManager.createBlog(createMockBlog(1));
      const post = await postsManager.createPost(createMockPost(1), blog.body.id);
      const emailConfirmationInfo = usersService.createEmailConfirmation(true);
      const user = await usersManager.createUser(createMockUser(1), emailConfirmationInfo);
      const loginUser = await authManager.login(mockLoginData(1));
      const response = await postsManager.updatePostByLike('Like', post.body.id, loginUser.body.accessToken);
      const getPost = await postsManager.getPostById(
        post.body.id
      );

      expect(response.status).toBe(204);
      expect(getPost.body.extendedLikesInfo).toEqual(
        expect.objectContaining({
          likesCount: expect.any(Number),
          dislikesCount: expect.any(Number),
        })
      );
      expect(getPost.body.extendedLikesInfo.likesCount).not.toBeLessThan(0)
      expect(getPost.body.extendedLikesInfo.dislikesCount).not.toBeLessThan(0)
      expect(getPost.body.extendedLikesInfo.likesCount).toBe(1)
      expect(getPost.body.extendedLikesInfo.dislikesCount).toBe(0)
    });

    it('/sa/blogs/blogId/:postId (DELETE)', async () => {
      const blog = await blogsManager.createBlog(createMockBlog(35));
      const newPost = await postsManager.createPost(createMockPost(15), blog.body.id);
      const response = await postsManager.deletePost(newPost.body.id, blog.body.id);
      const post = await postsManager.getPostById(newPost.body.id);
      expect(response.status).toBe(204);
      expect(post.body).toHaveProperty('error');
      // expect(posts.body.items.length).toBeLessThan(1);
    });

    describe('BadRequest (e2e)', () => {
      it('should return 400 if required field is missing on create blog', async () => {
        const invalidPayload = {
          title: '',
          shortDescription: 'Invalid',
          content: '12',
        };

        const blog = await blogsManager.createBlog(createMockBlog(37));
        const response = await postsManager.createPost(invalidPayload, blog.body.id);
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
          expect(['title', 'content']).toContain(error.field);
          // expect(error.field === 'name' || error.field === 'websiteUrl').toBeTruthy();
        });
      });

      it('should return 400 if required field is missing on update blog', async () => {
        const invalidPayload = {
          title: '',
          shortDescription: 'Invalid',
          content: '12',
        };

        const blog = await blogsManager.createBlog(createMockBlog(38));
        const post = await postsManager.createPost(createMockPost(18), blog.body.id);
        const response = await postsManager.updatePost(invalidPayload, blog.body.id, post.body.id);
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
          expect(['title', 'content']).toContain(error.field);
        });
      });

      it('should return 400 if like-status field has no correct value', async () => {
        const blog = await blogsManager.createBlog(createMockBlog(1));
        const post = await postsManager.createPost(createMockPost(1), blog.body.id);
        const emailConfirmationInfo = usersService.createEmailConfirmation(true);
        const user = await usersManager.createUser(createMockUser(1), emailConfirmationInfo);
        const loginUser = await authManager.login(mockLoginData(1));
        const response = await postsManager.updatePostByLike('', post.body.id, loginUser.body.accessToken);
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
          expect(['likeStatus']).toContain(error.field);
        });
      });


    });

    describe('NotFound (e2e)', () => {
      it('should return 404 if id field from URL not found on delete post', async () => {
        const blog = await blogsManager.createBlog(createMockBlog(38));
        const post = await postsManager.createPost(createMockPost(17), blog.body.id);
        const deletePost = await postsManager.deletePost(post.body.id, blog.body.id);
        const findedPost = await postsManager.getPostById(post.body.id);
        expect(findedPost.status).toBe(404);
        expect(findedPost.body).toHaveProperty('statusCode', 404);
        expect(findedPost.body).toHaveProperty('message');
      });

      it('should return 404 if id field from URL not found on update post', async () => {
        const blog = await blogsManager.createBlog(createMockBlog(39));
        const post = await postsManager.createPost(createMockPost(18), blog.body.id);
        const deletePost = await postsManager.deletePost(post.body.id, blog.body.id);
        const upd = await postsManager.updatePost(createMockPost(19), blog.body.id, post.body.id);
        expect(upd.status).toBe(404);
        expect(upd.body).toHaveProperty('statusCode', 404);
        expect(upd.body).toHaveProperty('message');
      });
    });

    describe('AuthGuard (e2e)', () => {
      it('should return 401 when no token is provided', async () => {
        const blog = await blogsManager.createBlog(createMockBlog(41));
        const post = await postsManager.createPostWOAuth(createMockPost(31), blog.body.id);
        expect(post.status).toBe(401);
        expect(post.body).toHaveProperty('message');
        expect(typeof post.body.message).toBe('string');
      });
    });

  });
});
