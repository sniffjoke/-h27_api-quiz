import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepositoryTO } from '../../infrastructure/posts.repository.to';
import { BlogsRepositoryTO } from '../../../blogs/infrastructure/blogs.repository.to';

export class DeletePostWithBlogInParamsCommand {
  constructor(
    public postId: string,
    public blogId: string
  ) {
  }

}

@CommandHandler(DeletePostWithBlogInParamsCommand)
export class DeletePostWithBlogInParamsUseCase
  implements ICommandHandler<DeletePostWithBlogInParamsCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepositoryTO,
    private readonly postsRepository: PostsRepositoryTO
  ) {
  }

  async execute(command: DeletePostWithBlogInParamsCommand) {
    const findedBlog = await this.blogsRepository.findBlogById(command.blogId)
    const deletePost = await this.postsRepository.deletePostFromBlogsUri(command.postId, command.blogId)
    return deletePost
  }
}
