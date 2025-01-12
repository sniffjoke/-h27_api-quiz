import { Module } from '@nestjs/common';
import { QuizService } from './application/quiz.service';
import { QuizController } from './api/quiz.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/domain/user.entity';
import { GamePairEntity } from './domain/game-pair.entity';
import { PlayerProgressEntity } from './domain/player-progress.entity';
import { AnswerEntity } from './domain/answer.entity';
import { QuestionEntity } from './domain/question.entity';
import { QuizQueryRepositoryTO } from './infrastructure/quiz.query-repository.to';
import { QuizRepositoryTO } from './infrastructure/quiz.repository.to';
import { UsersModule } from '../users/users.module';
import { QuestionsController } from './api/questions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, GamePairEntity, PlayerProgressEntity, QuestionEntity, AnswerEntity]),
    UsersModule
  ],
  controllers: [QuizController, QuestionsController],
  providers: [
    QuizQueryRepositoryTO,
    QuizRepositoryTO,
    QuizService
  ],
  exports: [
    // QuizQueryRepositoryTO
  ]
})
export class QuizModule {}
