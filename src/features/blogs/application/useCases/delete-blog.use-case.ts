import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepositoryTO } from '../../infrastructure/blogs.repository.to';

export class DeleteBlogCommand {
  constructor(
    public id: string
  ) {
  }

}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase
  implements ICommandHandler<DeleteBlogCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepositoryTO
  ) {
  }

  async execute(command: DeleteBlogCommand) {
    const findedBlog = await this.blogsRepository.findBlogById(command.id)
    const deleteBlog = await this.blogsRepository.deleteBlog(command.id)
    return deleteBlog
  }
}
