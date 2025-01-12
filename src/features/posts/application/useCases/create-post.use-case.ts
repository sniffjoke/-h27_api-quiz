import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostCreateModel } from '../../api/models/input/create-post.input.model';
import { BlogsRepositoryTO } from '../../../blogs/infrastructure/blogs.repository.to';
import { PostsRepositoryTO } from '../../infrastructure/posts.repository.to';

export class CreatePostCommand {
  constructor(
    public postCreateModel: PostCreateModel
  ) {
  }

}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase
  implements ICommandHandler<CreatePostCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepositoryTO,
    private readonly postsRepository: PostsRepositoryTO
  ) {
  }

  async execute(command: CreatePostCommand) {
    const findedBlog = await this.blogsRepository.findBlogById(command.postCreateModel.blogId);
    const newPostId = await this.postsRepository.createPost(command.postCreateModel, findedBlog.name);
    return newPostId;
  }
}
