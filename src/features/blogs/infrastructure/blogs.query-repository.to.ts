import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogViewModel } from '../api/models/output/blog.view.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationBaseModel } from '../../../core/base/pagination.base.model';
import { BlogEntity } from '../domain/blogs.entity';


@Injectable()
export class BlogsQueryRepositoryTO {
  constructor(
    @InjectRepository(BlogEntity) private readonly bRepository: Repository<BlogEntity>
  ) {
  }

  async getAllBlogsWithQuery(query: any) {
    const generateQuery = await this.generateQuery(query);
    const items = await this.bRepository
      .createQueryBuilder('b')
      .where('LOWER(b.name) LIKE LOWER(:name)', {name: generateQuery.searchNameTerm.toLowerCase()})
      .orderBy(`"${generateQuery.sortBy}"`, generateQuery.sortDirection.toUpperCase())
      .skip((generateQuery.page - 1) * generateQuery.pageSize)
      .take(generateQuery.pageSize)
      .getMany()
    const itemsOutput = items.map(item => this.blogOutputMap(item));
    const resultBlogs = new PaginationBaseModel<BlogViewModel>(generateQuery, itemsOutput);
    return resultBlogs;
  }

  private async generateQuery(query: any) {
    const searchNameTerm: string = query.searchNameTerm ? query.searchNameTerm : '';
    const totalCount = await this.bRepository
      .createQueryBuilder('b')
      .where('LOWER(b.name) LIKE LOWER(:name)', {name: `%${searchNameTerm.toLowerCase()}%`})
      .getCount()
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      totalCount,
      pageSize,
      pagesCount,
      page: query.pageNumber ? Number(query.pageNumber) : 1,
      sortBy: query.sortBy ? query.sortBy : 'createdAt',
      sortDirection: query.sortDirection ? query.sortDirection : 'desc',
      searchNameTerm: '%' + searchNameTerm + '%',
    };
  }

  async blogOutput(id: string) {
    const findedBlog = await this.bRepository.findOne({
      where: { id },
    })
    if (!findedBlog) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }
    return this.blogOutputMap(findedBlog);
  }

  blogOutputMap(blog: BlogViewModel) {
    const { id, name, description, websiteUrl, isMembership, createdAt } = blog;
    return {
      id: id.toString(),
      name,
      description,
      websiteUrl,
      createdAt,
      isMembership,
    };
  }

}
