import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogCreateModel } from '../api/models/input/create-blog.input.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';


@Injectable()
export class BlogsRepository {
    constructor(
      @InjectDataSource() public readonly dataSource: DataSource
    ) {
    }

    async create(blog: BlogCreateModel) {
        const createBlog = await this.dataSource.query(
          `
                    INSERT INTO blogs ("name", "description", "websiteUrl")
                    VALUES ($1, $2, $3)
                    RETURNING *
          `,
          [blog.name, blog.description, blog.websiteUrl],
        )
        return createBlog[0].id
    }

    async findBlogById(id: string) {
        const findedBlog = await this.dataSource.query(
          `
                    SELECT * FROM blogs
                    WHERE "id" = $1          
                `,
          [id]
        )
        if (!findedBlog.length) {
            throw new NotFoundException(`Blog with id ${id} not found`)
        }
        return findedBlog[0]
    }

    async updateBlogById(id: string, dto: BlogCreateModel) {
        const updateBlog = await this.dataSource.query(
          `
                    UPDATE blogs
                    SET "name" = $1, "description" = $2, "websiteUrl" = $3
                    WHERE "id" = $4          
          `,
          [
            dto.name,
            dto.description,
            dto.websiteUrl,
            id
          ]
        )
        return updateBlog
    }

    async deleteBlog(id: string) {
        const findedBlog = await this.findBlogById(id)
        const deleteBlog = await this.dataSource.query(
          `
                    DELETE FROM blogs WHERE "id" = $1
                `,
          [id]
        )
        return deleteBlog
    }
}
