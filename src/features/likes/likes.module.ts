import { Module } from '@nestjs/common';
import { LikeHandler } from './domain/like.handler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeEntity } from './domain/likes.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LikeEntity]),
  ],
  controllers: [],
  providers: [
    LikeHandler
  ],
  exports: [
    LikeHandler
  ]
})
export class LikesModule {}
