import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Or, Repository } from 'typeorm';
import { PaginationBaseModel } from '../../../core/base/pagination.base.model';
import { UserEntity } from '../domain/user.entity';


@Injectable()
export class UsersQueryRepositoryTO {
  constructor(
    @InjectRepository(UserEntity) private readonly uRepository: Repository<UserEntity>
  ) {
  }

  async userOutput(id: string) {
    const findedUser = await this.uRepository.findOne(
      { where: { id } },
    );
    if (!findedUser) {
      throw new NotFoundException('User not found');
    }
    return this.userMap(findedUser);
  }

  userMap(user: UserEntity) {
    const { email, login, createdAt, id } = user;
    return {
      id: id.toString(),
      login,
      email,
      createdAt,
    };
  }

  async getAllUsersWithQuery(query: any) {
    const generateQuery = await this.generateQuery(query);
    const items = await this.uRepository
      .find({
        where: [
          { email: Or(ILike(`${generateQuery.searchEmailTerm}`)) },
          { login: Or(ILike(`${generateQuery.searchLoginTerm}`)) },
        ],
        order: {
          [generateQuery.sortBy]: generateQuery.sortDirection,
        },
        take: generateQuery.pageSize,
        skip: (generateQuery.page - 1) * generateQuery.pageSize,
      });
    const itemsOutput = items.map((item: any) => this.userMap(item));
    const resultPosts = new PaginationBaseModel(generateQuery, itemsOutput);
    return resultPosts;
  }

  private async generateQuery(query: any) {
    const searchLoginTerm = query.searchLoginTerm ? query.searchLoginTerm : '';
    const searchEmailTerm = query.searchEmailTerm ? query.searchEmailTerm : '';
    const totalCount = await this.uRepository.count(
      {
        where: [
          { email: Or(ILike(`%${searchEmailTerm}%`)) },
          { login: Or(ILike(`%${searchLoginTerm}%`)) },
        ],
      },
    );
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const pagesCount = Math.ceil(Number(totalCount) / pageSize);
    return {
      totalCount: Number(totalCount),
      pageSize,
      pagesCount,
      page: query.pageNumber ? Number(query.pageNumber) : 1,
      sortBy: query.sortBy ? query.sortBy : 'createdAt',
      sortDirection: query.sortDirection ? query.sortDirection : 'desc',
      searchLoginTerm: `%` + searchLoginTerm + '%',
      searchEmailTerm: '%' + searchEmailTerm + '%',
    };
  }

}
