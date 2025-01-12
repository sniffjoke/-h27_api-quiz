import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';


@Injectable()
export class TestingService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
  }

  async deleteAll() {

    return await this.dataSource.query(
      `
              TRUNCATE TABLE answer RESTART IDENTITY CASCADE;
              TRUNCATE TABLE question RESTART IDENTITY CASCADE;
              TRUNCATE TABLE "playerProgress" RESTART IDENTITY CASCADE;
              TRUNCATE TABLE "gamePair" RESTART IDENTITY CASCADE;
              TRUNCATE TABLE likes RESTART IDENTITY CASCADE;
              TRUNCATE TABLE comments RESTART IDENTITY CASCADE;
              TRUNCATE TABLE posts RESTART IDENTITY CASCADE;
              TRUNCATE TABLE devices RESTART IDENTITY CASCADE;
              TRUNCATE TABLE tokens RESTART IDENTITY CASCADE;
              TRUNCATE TABLE blogs RESTART IDENTITY CASCADE;
              TRUNCATE TABLE users RESTART IDENTITY CASCADE;
      `
      ,
    );
  }

}
