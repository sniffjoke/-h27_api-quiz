import { UpdateBlogUseCase } from './update-blog.use-case';
import { CreateBlogUseCase } from './create-blog.use-case';
import { UpdatePostWithBlogInParamsUseCase } from './update-post-from-blogs-in-params.use-case';
import { DeletePostWithBlogInParamsUseCase } from './delete-post-from-blogs-in-params.use-case';
import { DeleteBlogUseCase } from './delete-blog.use-case';

export const BlogsCommandHandlers = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  UpdatePostWithBlogInParamsUseCase,
  DeletePostWithBlogInParamsUseCase
];
