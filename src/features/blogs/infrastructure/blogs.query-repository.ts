import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogViewModel } from '../api/models/output/blog.view.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PaginationBaseModel } from '../../../core/base/pagination.base.model';


@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
  }

  async getAllBlogsWithQuery(query: any) {
    const generateQuery = await this.generateQuery(query);
    const items = await this.dataSource.query(
      `
                SELECT * 
                FROM blogs 
                WHERE "name" ILIKE $1
                ORDER BY "${generateQuery.sortBy}" ${generateQuery.sortDirection}
                OFFSET $2
                LIMIT $3         
          `,
      [
        generateQuery.searchNameTerm,
        (generateQuery.page - 1) * generateQuery.pageSize,
        generateQuery.pageSize,
      ]
    );
    const itemsOutput = items.map(item => this.blogOutputMap(item));
    const resultBlogs = new PaginationBaseModel<BlogViewModel>(generateQuery, itemsOutput);
    return resultBlogs;
  }

  private async generateQuery(query: any) {
    const searchNameTerm: string = query.searchNameTerm ? query.searchNameTerm : '';
    const totalCount = await this.dataSource.query(
      `
                SELECT COUNT(*) 
                FROM blogs 
                WHERE "name" ILIKE $1
            `,
      [
        '%' + searchNameTerm + '%',
      ]
    );
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const pagesCount = Math.ceil(Number(totalCount[0].count) / pageSize);

    return {
      totalCount: Number(totalCount[0].count),
      pageSize,
      pagesCount,
      page: query.pageNumber ? Number(query.pageNumber) : 1,
      sortBy: query.sortBy ? query.sortBy : 'createdAt',
      sortDirection: query.sortDirection ? query.sortDirection : 'desc',
      searchNameTerm: '%' + searchNameTerm + '%',
    };
  }

  async blogOutput(id: string) {
    const findedBlog = await this.dataSource.query(
      `
            SELECT * FROM blogs 
            WHERE id=${id}
          `
    );
    if (!findedBlog.length) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }
    return this.blogOutputMap(findedBlog[0]);
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
