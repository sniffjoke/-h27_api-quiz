import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogCreateModel } from '../../api/models/input/create-blog.input.model';
import { BlogsRepositoryTO } from '../../infrastructure/blogs.repository.to';

export class CreateBlogCommand {
  constructor(
    public blogCreateModel: BlogCreateModel
  ) {
  }

}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase
  implements ICommandHandler<CreateBlogCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepositoryTO
  ) {
  }

  async execute(command: CreateBlogCommand) {
    const newBlogId = await this.blogsRepository.createBlog(command.blogCreateModel)
    return newBlogId
  }
}
