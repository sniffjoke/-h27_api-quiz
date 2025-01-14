import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamePairEntity } from '../domain/game-pair.entity';
import { PaginationBaseModel } from '../../../core/base/pagination.base.model';
import { QuestionEntity } from '../domain/question.entity';
import { QuestionViewModel, QuestionViewModelForPairs } from '../api/models/output/question.view.model';
import { PublishedStatuses } from '../api/models/input/update-publish-status.input.model';
import { UserEntity } from '../../users/domain/user.entity';
import { GamePairViewModel } from '../api/models/output/game-pair.view.model';
import { AnswerEntity } from '../domain/answer.entity';
import { AnswerViewModel, AnswerViewModelForPairs } from '../api/models/output/answer.view.model';
import { MyStatisticViewModel } from '../api/models/output/my-statistic.view.model';
import { AllStatisticViewModel } from '../api/models/output/all-statistic.view.model';
import { UserScoreEntity } from '../domain/user-score.entity';


@Injectable()
export class QuizQueryRepositoryTO {

  constructor(
    @InjectRepository(GamePairEntity) private readonly gRepository: Repository<GamePairEntity>,
    @InjectRepository(QuestionEntity) private readonly questionRepository: Repository<QuestionEntity>,
    @InjectRepository(AnswerEntity) private readonly answerRepository: Repository<AnswerEntity>,
    @InjectRepository(UserScoreEntity) private readonly userScoreRepository: Repository<UserScoreEntity>,
  ) {
  }

  //------------------------------------------------------------------------------------------//
  //------------------------------------QUESTIONS---------------------------------------------//
  //------------------------------------------------------------------------------------------//

  async getAllQuestionsWithQuery(query: any) {
    const generateQuery = await this.generateQuery(query);
    const items = this.questionRepository
      .createQueryBuilder('q')
      .where('LOWER(q.body) LIKE LOWER(:name)', { name: `%${generateQuery.bodySearchTerm.toLowerCase()}%` })
      .orderBy(`"${generateQuery.sortBy}"`, generateQuery.sortDirection.toUpperCase())
      .skip((generateQuery.page - 1) * generateQuery.pageSize)
      .take(generateQuery.pageSize);
    if (generateQuery.publishedStatus === PublishedStatuses.PUBLISHED) {
      items.andWhere('q.published = :status', { status: true });
    } else if (generateQuery.publishedStatus === PublishedStatuses.NOTPUBLISHED) {
      items.andWhere('q.published = :status', { status: false });
    }
    const itemsWithQuery = await items
      .getMany();
    const itemsOutput = itemsWithQuery.map((item) => this.questionOutputMap(item));
    const resultQuestions = new PaginationBaseModel<QuestionViewModel>(generateQuery, itemsOutput);
    return resultQuestions;
  }

  private async generateQuery(query: any) {
    const bodySearchTerm: string = query.bodySearchTerm ? query.bodySearchTerm : '';
    const publishedStatus: string = query.publishedStatus ? query.publishedStatus : 'All';
    const totalCount = this.questionRepository
      .createQueryBuilder('q')
      .where('LOWER(q.body) LIKE LOWER(:name)', { name: `%${bodySearchTerm.toLowerCase()}%` });
    if (query.publishedStatus === PublishedStatuses.PUBLISHED) {
      totalCount.andWhere('q.published = :status', { status: true });
    } else if (query.publishedStatus === PublishedStatuses.NOTPUBLISHED) {
      totalCount.andWhere('q.published = :status', { status: false });
    }
    const totalCountWithQuery = await totalCount.getCount();
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const pagesCount = Math.ceil(totalCountWithQuery / pageSize);

    return {
      totalCount: totalCountWithQuery,
      pageSize,
      pagesCount,
      page: query.pageNumber ? Number(query.pageNumber) : 1,
      sortBy: query.sortBy ? query.sortBy : 'createdAt',
      sortDirection: query.sortDirection ? query.sortDirection : 'desc',
      bodySearchTerm,
      publishedStatus,
    };
  }

  async questionOutput(id: string) {
    const findedQuestion = await this.questionRepository.findOne({
      where: { id },
    });
    if (!findedQuestion) {
      throw new NotFoundException(`Question with id ${id} not found`);
    }
    return this.questionOutputMap(findedQuestion);
  }

  questionOutputMap(question: QuestionEntity): QuestionViewModel {
    const {
      id, body, correctAnswers, published,
      createdAt,
      updatedAt,
    } = question;
    return {
      id: id.toString(),
      body,
      correctAnswers,
      published,
      createdAt,
      updatedAt: updatedAt ? updatedAt : null,
    };
  }

  questionsOutputMap(questions: QuestionEntity[]): QuestionViewModelForPairs[] {
    const newQuestionsArray = questions.map(question => ({
      id: question.id.toString(),
      body: question.body,
    }));
    const questionOutput = newQuestionsArray.sort((a, b) => Number(a.id) - Number(b.id));
    return questionOutput;
  }

  //------------------------------------------------------------------------------------------//
  //----------------------------------------GAME----------------------------------------------//
  //------------------------------------------------------------------------------------------//

  async getAllMyGamesWithQuery(query: any, user: UserEntity) {
    const generateQuery = await this.generateQueryForMyGames(query, user);
    const items = this.gRepository
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.questions', 'q')
      .leftJoinAndSelect('g.firstPlayerProgress', 'f')
      .leftJoinAndSelect('g.secondPlayerProgress', 's')
      .leftJoinAndSelect('f.user', 'user-first')
      .leftJoinAndSelect('s.user', 'user-second')
      .leftJoinAndSelect('f.answers', 'answers-first')
      .leftJoinAndSelect('s.answers', 'answers-second')
      .where('f.userId = :userId', { userId: user.id })
      .orWhere('s.userId = :userId', { userId: user.id })
      .orderBy(`g.${generateQuery.sortBy}`, generateQuery.sortDirection.toUpperCase())
      .addOrderBy('g.pairCreatedDate', 'DESC')
      .skip((generateQuery.page - 1) * generateQuery.pageSize)
      .take(generateQuery.pageSize);
    const itemsWithQuery = await items
      .getMany();
    const itemsOutput = itemsWithQuery.map((item) => this.gamePairOutputMap(item));
    const resultQuestions = new PaginationBaseModel<GamePairViewModel>(generateQuery, itemsOutput);
    return resultQuestions;
  }

  private async generateQueryForMyGames(query: any, user: UserEntity) {
    const totalCount = this.gRepository
      .createQueryBuilder('g')
      .innerJoinAndSelect('g.firstPlayerProgress', 'f')
      .innerJoinAndSelect('g.secondPlayerProgress', 's')
      .where('f.userId = :userId', { userId: user.id })
      .orWhere('s.userId = :userId', { userId: user.id });
    const totalCountWithQuery = await totalCount.getCount();
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const pagesCount = Math.ceil(totalCountWithQuery / pageSize);

    return {
      totalCount: totalCountWithQuery,
      pageSize,
      pagesCount,
      page: query.pageNumber ? Number(query.pageNumber) : 1,
      sortBy: query.sortBy ? query.sortBy : 'pairCreatedDate',
      sortDirection: query.sortDirection ? query.sortDirection : 'desc',
    };
  }

  async gameOutput(id: number) {
    const findedGame = await this.gRepository.findOne({
      where: { id },
      relations: ['firstPlayerProgress.user', 'secondPlayerProgress.user', 'questions'],
    });
    if (!findedGame) {
      throw new NotFoundException(`Game with id ${id} not found`);
    }
    return this.gamePairOutputMap(findedGame);
  }

  gamePairOutputMap(game: GamePairEntity): GamePairViewModel {
    const {
      id,
      firstPlayerProgress,
      secondPlayerProgress,
      questions: questions,
      status,
      pairCreatedDate,
      startGameDate,
      finishGameDate,
    } = game;
    return {
      id: id.toString(),
      firstPlayerProgress: {
        answers: firstPlayerProgress?.answers?.length ? this.answersOutputMap(firstPlayerProgress.answers) : [],
        player: {
          id: firstPlayerProgress?.user?.id.toString(),
          login: firstPlayerProgress?.user?.login,
        },
        score: firstPlayerProgress?.score,
      },
      secondPlayerProgress: secondPlayerProgress ? {
        answers: secondPlayerProgress?.answers?.length ? this.answersOutputMap(secondPlayerProgress.answers) : [],
        player: {
          id: secondPlayerProgress?.user?.id.toString(),
          login: secondPlayerProgress?.user?.login,
        },
        score: secondPlayerProgress?.score,
      } : null,
      questions: questions?.length ? this.questionsOutputMap(questions) : null,
      status,
      pairCreatedDate,
      startGameDate,
      finishGameDate,
    };
  }

  //------------------------------------------------------------------------------------------//
  //--------------------------------------STATISTIC-------------------------------------------//
  //------------------------------------------------------------------------------------------//

  async getAllStatistic(query: any): Promise<PaginationBaseModel<UserScoreEntity>> {
    const generateQuery = await this.generateQueryForAllStats(query);
    console.log('generate: ', generateQuery);
    const sortOptions = generateQuery.sort.map((item) => {
      const [key, value] = item.split(' ')
      return {sortKey: key, sortValue: value.toUpperCase()}
    });
    const allStatisticsBuilder = this.userScoreRepository
      .createQueryBuilder('score')
      .innerJoinAndSelect('score.user', 'user')
    sortOptions.map((item) => {
      return allStatisticsBuilder.addOrderBy(`"${item.sortKey}"`, item.sortValue)
    });
    const getAllStatistics = await allStatisticsBuilder
      .skip((generateQuery.page - 1) * generateQuery.pageSize)
      .limit(generateQuery.pageSize)
      .getMany();
    const allStatisticOutput = getAllStatistics.map(info => this.allStatisticOutputMap(info))
    const resultQuestions = new PaginationBaseModel<UserScoreEntity>(generateQuery, allStatisticOutput);
    return resultQuestions
  }

  private async generateQueryForAllStats(query: any) {
    const totalCount = this.userScoreRepository
      .createQueryBuilder('score')
    const totalCountWithQuery = await totalCount.getCount();
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const pagesCount = Math.ceil(totalCountWithQuery / pageSize);

    return {
      totalCount: totalCountWithQuery,
      pageSize,
      pagesCount,
      page: query.pageNumber ? Number(query.pageNumber) : 1,
      sort: query.sort ? query.sort : [ 'avgScores desc', 'sumScore desc' ],
      // sortDirection: query.sortDirection ? query.sortDirection : 'desc',
    };
  }


  allStatisticOutputMap(statisticInfo: UserScoreEntity): AllStatisticViewModel {
    const {
      sumScore,
      avgScores,
      gamesCount,
      winsCount,
      lossesCount,
      drawsCount,
      user
    } = statisticInfo;
    return {
      sumScore,
      avgScores,
      gamesCount,
      winsCount,
      lossesCount,
      drawsCount,
      player: {
        id: user.id.toString(),
        login: user.login
      }
    };
  }

  myStatisticOutputMap(statisticInfo: any): MyStatisticViewModel {
    const {
      sumScore,
      avgScores,
      gamesCount,
      winsCount,
      lossesCount,
      drawsCount,
    } = statisticInfo;
    return {
      sumScore,
      avgScores,
      gamesCount,
      winsCount,
      lossesCount,
      drawsCount
    };
  }

  //------------------------------------------------------------------------------------------//
  //--------------------------------------ANSWERS----------------------------------------------//
  //------------------------------------------------------------------------------------------//

  async answerOutput(id: string) {
    const findedAnswer = await this.answerRepository.findOne({
      where: { id },
    });
    if (!findedAnswer) {
      throw new NotFoundException(`Answer with id ${id} not found`);
    }
    return this.answerOutputMap(findedAnswer);
  }

  answerOutputMap(answer: AnswerEntity): AnswerViewModel {
    const {
      questionId,
      answerStatus,
      addedAt,
    } = answer;
    return {
      questionId: questionId.toString(),
      answerStatus,
      addedAt,
    };
  }

  answersOutputMap(answers: AnswerEntity[]): AnswerViewModelForPairs[] {
    const newAnswersArray = answers.map(answer => ({
      questionId: answer.questionId.toString(),
      answerStatus: answer.answerStatus,
      addedAt: answer.addedAt,
    }));
    const answersOutput = newAnswersArray.sort((a, b) => Number(a.addedAt) - Number(b.addedAt));
    return answersOutput;
  }


}
