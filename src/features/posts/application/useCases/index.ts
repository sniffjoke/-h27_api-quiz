import { CreatePostUseCase } from './create-post.use-case';
import { UpdatePostWithBlogInParamsUseCase } from './update-post-from-blogs-in-params.use-case';
import { DeletePostWithBlogInParamsUseCase } from './delete-post-from-blogs-in-params.use-case';

export const PostsCommandHandlers = [
  CreatePostUseCase,
  DeletePostWithBlogInParamsUseCase,
  UpdatePostWithBlogInParamsUseCase
];
