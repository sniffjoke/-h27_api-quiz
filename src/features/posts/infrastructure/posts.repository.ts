import { Injectable, NotFoundException } from '@nestjs/common';
import { PostCreateModel, PostCreateModelWithParams } from '../api/models/input/create-post.input.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';


@Injectable()
export class PostsRepository {

  constructor(
    @InjectDataSource() public readonly dataSource: DataSource,
  ) {
  }

  async createPost(post: PostCreateModel, blogName: string) {
    const newPost = await this.dataSource.query(
      `
                    INSERT INTO posts ("title", "shortDescription", "content", "blogId", "blogName")
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING *
          `,
      [
        post.title,
        post.shortDescription,
        post.content,
        post.blogId,
        blogName,
      ],
    );
    const newExtLikesInfo = await this.dataSource.query(
      `
              INSERT INTO "extendedLikesInfo" VALUES ($1, $2, $3)
      `, [
        newPost[0].id, 0, 0
      ]
    )
    return newPost[0].id;
  }

  async findPostById(id: string) {
    const findedPost = await this.dataSource.query(
      `
                    SELECT * 
                    FROM posts 
                    WHERE "id" = $1          
          `,
      [id]
    );
    if (!findedPost.length) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return findedPost[0];
  }

  async updatePostFromBlogsUri(postId: string, blogId: string, dto: PostCreateModelWithParams) {
    const findedPost = await this.findPostById(postId);
    const updatePost = await this.dataSource.query(
      `
                    UPDATE posts
                    SET "title" = $1, "shortDescription" = $2, "content" = $3
                    WHERE "id" = $4 AND "blogId" = $5          
          `,
      [
        dto.title,
        dto.shortDescription,
        dto.content,
        postId,
        blogId,
      ],
    );
    return updatePost;
  }

  async deletePostFromBlogsUri(postId: string, blogId: string) {
    const findedPost = await this.findPostById(postId);
    const deleteBlog = await this.dataSource.query(
      `
                    DELETE FROM posts  
                    WHERE "id" = $1 AND "blogId" = $2
                `,
      [
        postId,
        blogId
      ],
    );
    return deleteBlog;
  }

}
