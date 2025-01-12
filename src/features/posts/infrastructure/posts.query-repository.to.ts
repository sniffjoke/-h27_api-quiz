import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostViewModel } from '../api/models/output/post.view.model';
import { PaginationBaseModel } from '../../../core/base/pagination.base.model';
import { PostEntity } from '../domain/posts.entity';
import { BlogEntity } from '../../blogs/domain/blogs.entity';


@Injectable()
export class PostsQueryRepositoryTO {
  constructor(
    @InjectRepository(PostEntity) private readonly pRepository: Repository<PostEntity>,
    @InjectRepository(BlogEntity) private readonly bRepository: Repository<BlogEntity>,
  ) {
  }

  async getAllPostsWithQuery(query: any, blogId?: string) {
    const generateQuery = await this.generateQuery(query, blogId);
    if (blogId) {
      const findedBlog = await this.bRepository.findOne({
        where: { id: blogId },
      });
      if (!findedBlog) {
        throw new NotFoundException(`Blog with id ${blogId} not found`);
      }
    }

    const itemsRaw = blogId ?

      await this.pRepository
        .createQueryBuilder('p')
        .innerJoin('extendedLikesInfo', 'e', 'e."postId" = p."id"')
        .select([
          'p."id"',
          'p."title"',
          'p."shortDescription"',
          'p."content"',
          'p."blogId"',
          'p."blogName"',
          'p."createdAt"',
          'e."likesCount"',
          'e."dislikesCount"',
        ])
        .where('p.blogId = :blogId', { blogId })
        .orderBy(`"${generateQuery.sortBy}"`, generateQuery.sortDirection.toUpperCase())
        .offset((generateQuery.page - 1) * generateQuery.pageSize)
        .limit(generateQuery.pageSize)
        .getRawMany()
      :
      await this.pRepository
        .createQueryBuilder('p')
        .innerJoin('extendedLikesInfo', 'e', 'e."postId" = p."id"')
        .select([
          'p."id"',
          'p."title"',
          'p."shortDescription"',
          'p."content"',
          'p."blogId"',
          'p."blogName"',
          'p."createdAt"',
          'e."likesCount"',
          'e."dislikesCount"',
        ])
        .orderBy(`"${generateQuery.sortBy}"`, generateQuery.sortDirection.toUpperCase())
        .offset((generateQuery.page - 1) * generateQuery.pageSize)
        .limit(generateQuery.pageSize)
        .getRawMany();
    const items = itemsRaw.map(post => {
      return {
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: post.likesCount,
          dislikesCount: post.dislikesCount,
        },
      };
    });
    const itemsOutput = items.map(item => this.postOutputMap(item));
    const resultPosts = new PaginationBaseModel<PostViewModel>(generateQuery, itemsOutput);
    return resultPosts;
  }

  private async generateQuery(query: any, blogId?: string) {
    const totalCount = blogId ? await this.pRepository
        .createQueryBuilder('p')
        .where('p.blogId = :blogId', { blogId })
        .getCount()
      : await this.pRepository
        .createQueryBuilder('p')
        .getCount();
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const pagesCount = Math.ceil(totalCount / pageSize);
    return {
      totalCount,
      pageSize,
      pagesCount,
      page: query.pageNumber ? Number(query.pageNumber) : 1,
      sortBy: query.sortBy ? query.sortBy : 'createdAt',
      sortDirection: query.sortDirection ? query.sortDirection : 'desc',
    };
  }

  async postOutput(postId: string) {
    const findedPost = await this.pRepository
      .createQueryBuilder('p')
      .innerJoin('extendedLikesInfo', 'e', 'e."postId" = p."id"')
      .select([
        'p."id"',
        'p."title"',
        'p."shortDescription"',
        'p."content"',
        'p."blogId"',
        'p."blogName"',
        'p."createdAt"',
        'e."likesCount"',
        'e."dislikesCount"',
      ])
      .where('p.id = :id', { id: postId })
      .getRawOne();
    if (!findedPost) {
      throw new NotFoundException(`Post with id ${postId} not found`);
    }
    const post = {
      id: findedPost.id,
      title: findedPost.title,
      shortDescription: findedPost.shortDescription,
      content: findedPost.content,
      blogId: findedPost.blogId,
      blogName: findedPost.blogName,
      createdAt: findedPost.createdAt,
      extendedLikesInfo: {
        likesCount: findedPost.likesCount,
        dislikesCount: findedPost.dislikesCount,
      },
    };
    return this.postOutputMap(post);
  }

  postOutputMap(post: any) {
    const { id, title, shortDescription, content, blogId, blogName, createdAt, extendedLikesInfo} = post;
    return {
      id: id.toString(),
      title,
      shortDescription,
      content,
      blogId: blogId.toString(),
      blogName,
      extendedLikesInfo: {
        likesCount: extendedLikesInfo.likesCount,
        dislikesCount: extendedLikesInfo.dislikesCount
      },
      createdAt,
    };
  }

}
