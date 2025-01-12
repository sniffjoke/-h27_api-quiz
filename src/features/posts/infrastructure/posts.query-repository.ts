import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostViewModel } from '../api/models/output/post.view.model';
import { PaginationBaseModel } from '../../../core/base/pagination.base.model';


@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
  }

  async getAllPostsWithQuery(query: any, blogId?: string) {
    const generateQuery = await this.generateQuery(query, blogId);
    if (blogId) {
      const findedBlog = await this.dataSource.query(
        `
                        SELECT * 
                        FROM blogs 
                        WHERE "id" = $1
            `,
        [blogId],
      );
      if (!findedBlog.length) {
        throw new NotFoundException(`Blog with id ${blogId} not found`);
      }
    }
    // SELECT p.*, e.*
    // FROM posts p
    // INNER JOIN "extendedLikesInfo" e
    // ON e."postId" = p."id"
    const items = blogId ? await this.dataSource.query(
      `
                SELECT p.*, e.*
                FROM posts p
                INNER JOIN "extendedLikesInfo" e
                ON e."postId" = p."id"
                WHERE "blogId" = $1
                ORDER BY "${generateQuery.sortBy}" ${generateQuery.sortDirection}
                OFFSET $2
                LIMIT $3         
          `,
      [
        blogId,
        (generateQuery.page - 1) * generateQuery.pageSize,
        generateQuery.pageSize,
      ],
    ) : await this.dataSource.query(
      `
                SELECT p.*, e.*
                FROM posts p
                INNER JOIN "extendedLikesInfo" e
                ON e."postId" = p."id"
                ORDER BY "${generateQuery.sortBy}" ${generateQuery.sortDirection}
                OFFSET $1
                LIMIT $2        
          `,
      [
        (generateQuery.page - 1) * generateQuery.pageSize,
        generateQuery.pageSize,
      ],
    );
    const itemsOutput = items.map(item => this.postOutputMap(item));
    const resultPosts = new PaginationBaseModel<PostViewModel>(generateQuery, itemsOutput);
    return resultPosts;
  }

  private async generateQuery(query: any, blogId?: string) {
    const totalCount = blogId ? await this.dataSource.query(
      `
                SELECT COUNT(*) 
                FROM posts 
                WHERE "blogId" = $1
            `,
      [
        blogId,
      ],
    ) : await this.dataSource.query(
      `
                SELECT COUNT(*) 
                FROM posts 
            `,
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
    };
  }

  async postOutput(postId: string) {
    const findedPost = await this.dataSource.query(
      `
                    SELECT p.*, e.* 
                    FROM posts p
                    INNER JOIN "extendedLikesInfo" e
                    ON e."postId" = p."id" 
                    WHERE "id" = $1          
          `,
      [postId],
    );
    if (!findedPost.length) {
      throw new NotFoundException(`Post with id ${postId} not found`);
    }
    return this.postOutputMap(findedPost[0]);
  }

  postOutputMap(post: any) {
    const { id, title, shortDescription, content, blogId, blogName, createdAt, likesCount, dislikesCount } = post;
    return {
      id: id.toString(),
      title,
      shortDescription,
      content,
      blogId: blogId.toString(),
      blogName,
      extendedLikesInfo: {
        likesCount,
        dislikesCount,
      },
      createdAt,
    };
  }

}
