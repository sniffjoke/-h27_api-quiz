import { Injectable, NotFoundException } from '@nestjs/common';
import {CommentViewModel} from "../api/models/output/comment.view.model";
import { PaginationBaseModel } from '../../../core/base/pagination.base.model';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CommentEntity } from '../domain/comment.entity';
import { PostEntity } from '../../posts/domain/posts.entity';
import { TokensService } from '../../tokens/application/tokens.service';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { UsersRepositoryTO } from '../../users/infrastructure/users.repository.to';


@Injectable()
export class CommentsQueryRepositoryTO {
    constructor(
      @InjectDataSource() private readonly dataSource: DataSource,
      @InjectRepository(CommentEntity) private readonly cRepository: Repository<CommentEntity>,
      @InjectRepository(PostEntity) private readonly pRepository: Repository<PostEntity>,
      private readonly tokensService: TokensService,
      private readonly usersRepository: UsersRepositoryTO,
    ) {
    }

    async getAllCommentByPostIdWithQuery(query: any, postId: string) {
        const generateQuery = await this.generateQuery(query, postId)
        const findedPost = await this.pRepository
          .createQueryBuilder('p')
          .where('p.id = :id', { id: postId })
          .getOne()
        if (!findedPost) {
            throw new NotFoundException(`Post with id ${postId} not found`);
        }
        const comments = await this.cRepository
          .createQueryBuilder('c')
          .innerJoinAndSelect('c.likesInfo', 'l')
          .innerJoinAndSelect('c.user', 'u')
          .where('c.postId = :id', { id: postId })
          .orderBy('c.' + `${generateQuery.sortBy}`, generateQuery.sortDirection.toUpperCase())
          .skip((generateQuery.page - 1) * generateQuery.pageSize)
          .take(generateQuery.pageSize)
          .getMany()
        const commentsOutput = comments.map(item => this.commentOutputMap(item, item.user))
        const resultComments = new PaginationBaseModel<CommentViewModel>(generateQuery, commentsOutput)
        return resultComments
    }

    private async generateQuery(query: any, postId: string) {
        const totalCount = await this.dataSource.query(
          `
                SELECT COUNT(*) 
                FROM comments 
                WHERE "postId"=$1
            `,
          [
            postId
          ],
        )

        const pageSize = query.pageSize ? +query.pageSize : 10;
        const pagesCount = Math.ceil(Number(totalCount[0].count) / pageSize);
        return {
            totalCount: Number(totalCount[0].count),
            pageSize,
            pagesCount,
            page: query.pageNumber ? Number(query.pageNumber) : 1,
            sortBy: query.sortBy ? query.sortBy : 'createdAt',
            sortDirection: query.sortDirection ? query.sortDirection : 'desc'
        }
    }



    async commentOutput(id: string) {
        const findedComment = await this.cRepository
          .createQueryBuilder('c')
          .innerJoinAndSelect('c.likesInfo', 'l')
          .innerJoinAndSelect('c.user', 'u')
          .where('c.id = :id', { id: id })
          .getOne()
        if (!findedComment) {
            throw new NotFoundException("Comment not found")
        }
        const user = await this.usersRepository.findUserById(findedComment.user.id);
        return this.commentOutputMap(findedComment, user)
    }

    commentOutputMap(comment: any, user: any) {
        const {content, likesInfo, createdAt} = comment
        const id = comment.id.toString()
        return {
            id,
            content,
            commentatorInfo: {
                userId: (user.id).toString(),
                userLogin: user.login
            },
            likesInfo: {
                likesCount: likesInfo.likesCount,
                dislikesCount: likesInfo.dislikesCount,
            },
            createdAt
        }
    }

}
