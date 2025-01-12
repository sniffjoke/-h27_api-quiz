import { ExecutionContext, INestApplication } from '@nestjs/common';
import { initSettings } from '../helpers/init-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { createMockPost, PostsTestManager } from '../helpers/posts-test-helpers';
import { BlogsTestManager, createMockBlog } from '../helpers/blogs-test-helpers';
import { createMockUser, UsersTestManager } from '../helpers/users-test-helpers';
import { UsersService } from '../../src/features/users/application/users.service';
import { AuthTestManager, mockLoginData } from '../helpers/auth-test-helpers';
import { JwtService } from '@nestjs/jwt';
import { CommentsTestManager, createMockComment } from '../helpers/comments-test-helpers';
import { ThrottlerGuard } from '@nestjs/throttler';
import { checkLikeStatusString, checkWebsiteString } from '../helpers/test-helpers';

describe('CommentsController (e2e)', () => {
  let app: INestApplication;
  let postsManager: PostsTestManager;
  let blogsManager: BlogsTestManager;
  let usersManager: UsersTestManager;
  let usersService: UsersService;
  let authManager: AuthTestManager;
  let commentsManager: CommentsTestManager;


  beforeAll(async () => {
    const result = await initSettings(
      (moduleBuilder) =>
        moduleBuilder
          .overrideGuard(ThrottlerGuard)
          .useValue({
            canActivate: (_context: ExecutionContext) => true, // Разрешаем все запросы
          })
          .overrideProvider(JwtService)
          .useValue(
            new JwtService({
              secret: 'secret_key',
              signOptions: { expiresIn: '2s' },
            }),
          ),
    );
    app = result.app;
    blogsManager = result.blogTestManager;
    postsManager = result.postTestManager;
    usersManager = result.userTestManager;
    usersService = result.usersService;
    authManager = result.authTestManager;
    commentsManager = result.commentTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  describe('/posts/comments (e2e)', () => {

    it('/posts/postId/comments (POST)', async () => {
      const blog = await blogsManager.createBlog(createMockBlog(1));
      const post = await postsManager.createPost(createMockPost(1), blog.body.id);
      const emailConfirmationInfo = usersService.createEmailConfirmation(true);
      const user = await usersManager.createUser(createMockUser(1), emailConfirmationInfo);
      const loginUser = await authManager.login(mockLoginData(1));
      const comment = await commentsManager.createComment(
        createMockComment(1),
        post.body.id,
        loginUser.body.accessToken,
      );
      expect(comment.status).toBe(201);
      expect(comment.body).toHaveProperty('id');
      expect(comment.body).toHaveProperty('content');
      expect(comment.body).toHaveProperty('commentatorInfo');
      expect(comment.body).toHaveProperty('likesInfo');
      expect(comment.body).toHaveProperty('createdAt');
      expect(comment.body.commentatorInfo).toBeDefined();
      expect(comment.body.commentatorInfo).toHaveProperty('userId');
      expect(comment.body.commentatorInfo).toHaveProperty('userLogin');
      expect(comment.body.likesInfo).toBeDefined();
      expect(comment.body.likesInfo).toHaveProperty('likesCount');
      expect(comment.body.likesInfo).toHaveProperty('dislikesCount');
      expect(comment.body.likesInfo).toHaveProperty('myStatus');
      expect(new Date(comment.body.createdAt).toISOString()).toContain('T');
      expect(comment.body.createdAt).toBeDefined();
      expect(comment.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          content: expect.any(String),
          commentatorInfo: expect.any(Object),
          likesInfo: expect.any(Object),
          createdAt: expect.any(String),
        }),
      );
      expect(comment.body.commentatorInfo).toEqual(
        expect.objectContaining({
          userId: expect.any(String),
          userLogin: expect.any(String),
        }),
      );
      expect(comment.body.likesInfo).toEqual(
        expect.objectContaining({
          likesCount: expect.any(Number),
          dislikesCount: expect.any(Number),
          myStatus: expect.any(String),
        }),
      );
    });

    it('/posts/postId/comments (GET)', async () => {
      const blog = await blogsManager.createBlog(createMockBlog(2));
      const post = await postsManager.createPost(createMockPost(2), blog.body.id);
      const emailConfirmationInfo = usersService.createEmailConfirmation(true);
      const user = await usersManager.createUser(createMockUser(2), emailConfirmationInfo);
      const loginUser = await authManager.login(mockLoginData(2));
      for (let i = 2; i < 12; i++) {
        let res = await commentsManager.createComment(
          createMockComment(i),
          post.body.id,
          loginUser.body.accessToken,
        );
      }
      const comments = await commentsManager.getComments(post.body.id, loginUser.body.accessToken);
      expect(comments.status).toBe(200);
      expect(Array.isArray(comments.body.items)).toBe(true);
      expect(comments.body.items.length).toBeGreaterThan(0);
      comments.body.items.forEach((comment: any) => {
        expect(comment).toHaveProperty('id');
        expect(comment).toHaveProperty('content');
        expect(comment).toHaveProperty('commentatorInfo');
        expect(comment).toHaveProperty('likesInfo');
        expect(comment).toHaveProperty('createdAt');
        expect(comment.commentatorInfo).toBeDefined();
        expect(comment.commentatorInfo).toHaveProperty('userId');
        expect(comment.commentatorInfo).toHaveProperty('userLogin');
        expect(comment.likesInfo).toBeDefined();
        expect(comment.likesInfo).toHaveProperty('likesCount');
        expect(comment.likesInfo).toHaveProperty('dislikesCount');
        // expect(comment.likesInfo).toHaveProperty('myStatus');
      });
      comments.body.items.forEach((comment: any) => {
        expect(new Date(comment.createdAt).toISOString()).toContain('T');
        expect(comment.createdAt).toBeDefined();
        expect(new Date(comment.createdAt).toISOString()).toContain('T');
        expect(comment.commentatorInfo).toBeDefined();
        expect(comment.likesInfo).toBeDefined();
      });
      // expect(comments.body.items[0]).toEqual(
      //   expect.objectContaining({
      //     id: expect.any(String),
      //     content: expect.any(String),
      //     commentatorInfo: expect.any(Object),
      //     likesInfo: expect.any(Object),
      //     createdAt: expect.any(String),
      //   }),
      // );
      // expect(comments.body.items[0].commentatorInfo).toEqual(
      //   expect.objectContaining({
      //     userId: expect.any(String),
      //     userLogin: expect.any(String),
      //   }),
      // );
      // expect(comments.body.items[0].likesInfo).toEqual(
      //   expect.objectContaining({
      //     likesCount: expect.any(Number),
      //     dislikesCount: expect.any(Number),
      //     // myStatus: expect.any(String),
      //   }),
      // );
      if (comments.body.items.length === 0) {
        expect(comments.body.items).toEqual([]);
      } else {
        const dates = comments.body.items.map((comment: any) => new Date(comment.createdAt));
        // expect(dates).toEqual([...dates].sort((a, b) => b.getTime() - a.getTime()));
      }
    });

    it('/comments/:id (GET)', async () => {
      const blog = await blogsManager.createBlog(createMockBlog(3));
      const post = await postsManager.createPost(createMockPost(3), blog.body.id);
      const emailConfirmationInfo = usersService.createEmailConfirmation(true);
      const user = await usersManager.createUser(createMockUser(3), emailConfirmationInfo);
      const loginUser = await authManager.login(mockLoginData(3));
      const comment = await commentsManager.createComment(
        createMockComment(3),
        post.body.id,
        loginUser.body.accessToken,
      );
      const response = await commentsManager.getCommentById(comment.body.id, loginUser.body.accessToken);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('commentatorInfo');
      expect(response.body).toHaveProperty('likesInfo');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body.commentatorInfo).toBeDefined();
      expect(response.body.commentatorInfo).toHaveProperty('userId');
      expect(response.body.commentatorInfo).toHaveProperty('userLogin');
      expect(response.body.likesInfo).toBeDefined();
      expect(response.body.likesInfo).toHaveProperty('likesCount');
      expect(response.body.likesInfo).toHaveProperty('dislikesCount');
      expect(response.body.likesInfo).toHaveProperty('myStatus');
      expect(new Date(response.body.createdAt).toISOString()).toContain('T');
      expect(response.body.createdAt).toBeDefined();
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          content: expect.any(String),
          commentatorInfo: expect.any(Object),
          likesInfo: expect.any(Object),
          createdAt: expect.any(String),
        }),
      );
      expect(response.body.commentatorInfo).toEqual(
        expect.objectContaining({
          userId: expect.any(String),
          userLogin: expect.any(String),
        }),
      );
      expect(response.body.likesInfo).toEqual(
        expect.objectContaining({
          likesCount: expect.any(Number),
          dislikesCount: expect.any(Number),
          myStatus: expect.any(String),
        }),
      );
    });

    it('/comments/:id (PUT)', async () => {
      const blog = await blogsManager.createBlog(createMockBlog(4));
      const post = await postsManager.createPost(createMockPost(4), blog.body.id);
      const emailConfirmationInfo = usersService.createEmailConfirmation(true);
      const user = await usersManager.createUser(createMockUser(4), emailConfirmationInfo);
      const loginUser = await authManager.login(mockLoginData(4));
      const comment = await commentsManager.createComment(
        createMockComment(4),
        post.body.id,
        loginUser.body.accessToken,
      );
      const oldComment = await commentsManager.getCommentById(
        comment.body.id,
        loginUser.body.accessToken,
      );
      const response = await commentsManager.updateCommentById(createMockComment(5), comment.body.id, loginUser.body.accessToken);
      const newComment = await commentsManager.getCommentById(
        comment.body.id,
        loginUser.body.accessToken,
      );
      expect(response.status).toBe(204);
      expect(oldComment.body.content).not.toBe(newComment.body.content);
    });

    it('/comments/:id/like-status (PUT)', async () => {
      const blog = await blogsManager.createBlog(createMockBlog(12));
      const post = await postsManager.createPost(createMockPost(12), blog.body.id);
      const emailConfirmationInfo = usersService.createEmailConfirmation(true);
      const user = await usersManager.createUser(createMockUser(12), emailConfirmationInfo);
      const loginUser = await authManager.login(mockLoginData(12));
      const comment = await commentsManager.createComment(
        createMockComment(12),
        post.body.id,
        loginUser.body.accessToken,
      );
      const response = await commentsManager.updateCommentByLike('Like', comment.body.id, loginUser.body.accessToken);
      const getCommentAsAuthUser = await commentsManager.getCommentById(
        comment.body.id,
        loginUser.body.accessToken,
      );
      const getCommentAsNoAuthUser = await commentsManager.getCommentById(
        comment.body.id,
        '',
      );
      expect(response.status).toBe(204);
      expect(getCommentAsAuthUser.body.likesInfo).toEqual(
        expect.objectContaining({
          likesCount: expect.any(Number),
          dislikesCount: expect.any(Number),
          myStatus: expect.stringMatching(checkLikeStatusString),
        }),
      );
      expect(getCommentAsAuthUser.body.likesInfo.likesCount).not.toBeLessThan(0)
      expect(getCommentAsAuthUser.body.likesInfo.dislikesCount).not.toBeLessThan(0)
      expect(getCommentAsAuthUser.body.likesInfo.likesCount).toBe(1)
      expect(getCommentAsAuthUser.body.likesInfo.dislikesCount).toBe(0)
      expect(getCommentAsAuthUser.body.likesInfo.myStatus).toBe('Like')
      expect(getCommentAsNoAuthUser.body.likesInfo.myStatus).toBe('None')
    });

    it('/comments/:id (DELETE)', async () => {
      const blog = await blogsManager.createBlog(createMockBlog(6));
      const post = await postsManager.createPost(createMockPost(6), blog.body.id);
      const emailConfirmationInfo = usersService.createEmailConfirmation(true);
      const user = await usersManager.createUser(createMockUser(6), emailConfirmationInfo);
      const loginUser = await authManager.login(mockLoginData(6));
      const comment = await commentsManager.createComment(
        createMockComment(6),
        post.body.id,
        loginUser.body.accessToken,
      );
      const response = await commentsManager.deleteCommentById(comment.body.id, loginUser.body.accessToken);
      const getComment = await commentsManager.getCommentById(
        comment.body.id,
        loginUser.body.accessToken,
      );
      const comments = await commentsManager.getComments(post.body.id, loginUser.body.accessToken);
      expect(response.status).toBe(204);
      expect(comments.body.items.length).toBeLessThan(1);
      expect(getComment.body).toHaveProperty('error');
    });


  });

  describe('BadRequest (e2e)', () => {
    it('should return 400 if required field is missing on create comment', async () => {
      const invalidPayload = {
        content: '12',
      };
      const blog = await blogsManager.createBlog(createMockBlog(7));
      const post = await postsManager.createPost(createMockPost(7), blog.body.id);
      const emailConfirmationInfo = usersService.createEmailConfirmation(true);
      const user = await usersManager.createUser(createMockUser(7), emailConfirmationInfo);
      const loginUser = await authManager.login(mockLoginData(7));
      const response = await commentsManager.createComment(
        invalidPayload,
        post.body.id,
        loginUser.body.accessToken,
      );
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
        expect(['content']).toContain(error.field);
      });
    });

    it('should return 400 if required field is missing on update comment', async () => {
      const invalidPayload = {
        title: '',
        shortDescription: 'Invalid',
        content: '12',
      };
      const blog = await blogsManager.createBlog(createMockBlog(8));
      const post = await postsManager.createPost(createMockPost(8), blog.body.id);
      const emailConfirmationInfo = usersService.createEmailConfirmation(true);
      const user = await usersManager.createUser(createMockUser(8), emailConfirmationInfo);
      const loginUser = await authManager.login(mockLoginData(8));
      const comment = await commentsManager.createComment(
        createMockComment(8),
        post.body.id,
        loginUser.body.accessToken,
      );
      const response = await commentsManager.updateCommentById(
        invalidPayload,
        comment.body.id,
        loginUser.body.accessToken);
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
        expect(['content']).toContain(error.field);
      });
    });

    it('should return 400 if like-status field has no correct value', async () => {
      const blog = await blogsManager.createBlog(createMockBlog(12));
      const post = await postsManager.createPost(createMockPost(12), blog.body.id);
      const emailConfirmationInfo = usersService.createEmailConfirmation(true);
      const user = await usersManager.createUser(createMockUser(12), emailConfirmationInfo);
      const loginUser = await authManager.login(mockLoginData(12));
      const comment = await commentsManager.createComment(
        createMockComment(12),
        post.body.id,
        loginUser.body.accessToken,
      );
      const response = await commentsManager.updateCommentByLike('', comment.body.id, loginUser.body.accessToken);
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

  describe('AuthGuard (e2e)', () => {
    it('should return 401 when no token is provided', async () => {
      const blog = await blogsManager.createBlog(createMockBlog(9));
      const post = await postsManager.createPost(createMockPost(9), blog.body.id);
      const emailConfirmationInfo = usersService.createEmailConfirmation(true);
      const comment = await commentsManager.createComment(
        createMockComment(9),
        post.body.id,
        '',
      );
      expect(comment.status).toBe(401);
      expect(comment.body).toHaveProperty('message');
      expect(typeof comment.body.message).toBe('string');
    });
  });

  describe('NotFound (e2e)', () => {
    it('should return 404 if id field from URL not found on delete comment', async () => {
      const blog = await blogsManager.createBlog(createMockBlog(10));
      const post = await postsManager.createPost(createMockPost(10), blog.body.id);
      const emailConfirmationInfo = usersService.createEmailConfirmation(true);
      const user = await usersManager.createUser(createMockUser(10), emailConfirmationInfo);
      const loginUser = await authManager.login(mockLoginData(10));
      const comment = await commentsManager.createComment(
        createMockComment(10),
        post.body.id,
        loginUser.body.accessToken,
      );
      const deleteComment = await commentsManager.deleteCommentById(
        comment.body.id,
        loginUser.body.accessToken
      );
      const response = await commentsManager.deleteCommentById(
        comment.body.id,
        loginUser.body.accessToken,
      );
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 if id field from URL not found on update comment', async () => {
      const blog = await blogsManager.createBlog(createMockBlog(11));
      const post = await postsManager.createPost(createMockPost(11), blog.body.id);
      const emailConfirmationInfo = usersService.createEmailConfirmation(true);
      const user = await usersManager.createUser(createMockUser(11), emailConfirmationInfo);
      const loginUser = await authManager.login(mockLoginData(11));
      const comment = await commentsManager.createComment(
        createMockComment(11),
        post.body.id,
        loginUser.body.accessToken,
      );
      const deleteComment = await commentsManager.deleteCommentById(
        comment.body.id,
        loginUser.body.accessToken,
      );
      const response = await commentsManager.updateCommentById(createMockComment(5),
        comment.body.id,
        loginUser.body.accessToken
      );
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body).toHaveProperty('message');
    });
  });

});
