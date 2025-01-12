import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamePairEntity } from '../domain/game-pair.entity';
import { AnswerStatuses, GameStatuses } from '../api/models/input/create-pairs-status.input.model';
import { QuestionEntity } from '../domain/question.entity';
import { PlayerProgressEntity } from '../domain/player-progress.entity';
import { UserEntity } from '../../users/domain/user.entity';
import { AnswerEntity } from '../domain/answer.entity';
import { CreateQuestionInputModel } from '../api/models/input/create-question.input.model';
import { UpdatePublishStatusInputModel } from '../api/models/input/update-publish-status.input.model';
import { UserScoreEntity } from '../domain/user-score.entity';
import { GenerateStatisticHandler } from '../domain/generate-statistic.handler';


@Injectable()
export class QuizRepositoryTO {

  constructor(
    @InjectRepository(GamePairEntity) private readonly gRepository: Repository<GamePairEntity>,
    @InjectRepository(QuestionEntity) private readonly questionRepository: Repository<QuestionEntity>,
    @InjectRepository(UserScoreEntity) private readonly userScoreRepository: Repository<UserScoreEntity>,
    private readonly genStatHandler: GenerateStatisticHandler,
  ) {
  }

  async findOrCreateConnection(user: UserEntity): Promise<number> {
    const findLastGameForCurrentUser = await this.gRepository.find({
      where: { status: GameStatuses.Active },
      relations: ['firstPlayerProgress', 'secondPlayerProgress'],
    });
    for (const item of findLastGameForCurrentUser) {
      if (item.firstPlayerProgress.userId === user.id || item?.secondPlayerProgress?.userId === user.id) {
        throw new ForbiddenException('You cant connect because have an active game');
      }
    }
    let gamePair: GamePairEntity | null;
    gamePair = await this.gRepository.findOne({
      where: { status: GameStatuses.PendingSecondPlayer },
      relations: ['questions', 'firstPlayerProgress'],
    });
    if (!gamePair) {
      const newGame = new GamePairEntity();
      newGame.status = GameStatuses.PendingSecondPlayer;
      newGame.questions = null;

      const firstPlayerProgress = new PlayerProgressEntity();
      firstPlayerProgress.userId = user.id;
      firstPlayerProgress.user = user;
      firstPlayerProgress.answers = [];
      newGame.firstPlayerProgress = firstPlayerProgress;
      newGame.secondPlayerProgressId = null;
      const createGame = await this.gRepository.save(newGame);
      return createGame.id;
    } else {
      if (gamePair.firstPlayerProgress.userId === user.id) {
        throw new ForbiddenException('You cant connect for your own game pair');
      }
      const questions = await this.questionRepository
        .createQueryBuilder('q')
        .orderBy('q.id', 'ASC')
        .limit(5)
        .getMany();
      gamePair.status = GameStatuses.Active;
      gamePair.startGameDate = new Date(Date.now()).toISOString();
      gamePair.questions = questions;
      const secondPlayerProgress = new PlayerProgressEntity();
      secondPlayerProgress.userId = user.id;
      secondPlayerProgress.user = user;
      secondPlayerProgress.answers = [];
      gamePair.secondPlayerProgress = secondPlayerProgress;
      const saveGame = await this.gRepository.save(gamePair);
      return saveGame.id;
    }
  }

  async getGame(user: UserEntity) {
    const findedGame = await this.gRepository.findOne({
      where: [
        { status: GameStatuses.Active, firstPlayerProgress: { userId: user.id } },
        { status: GameStatuses.Active, secondPlayerProgress: { userId: user.id } },
        { status: GameStatuses.PendingSecondPlayer, firstPlayerProgress: { userId: user.id } },
        { status: GameStatuses.PendingSecondPlayer, secondPlayerProgress: { userId: user.id } },
      ],
      relations: [
        'firstPlayerProgress.user.score',
        'secondPlayerProgress.user.score',
        'firstPlayerProgress.answers',
        'secondPlayerProgress.answers',
        'questions',
      ],
    });
    if (!findedGame) {
      throw new NotFoundException('No game');
    }

    return findedGame;
  }

  async findGame(id: number, user: UserEntity) {
    if (!Number.isInteger(id)) {
      throw new BadRequestException('id is not integer');
    }
    const findedGame = await this.gRepository.findOne({
      where: { id },
      relations: [
        'firstPlayerProgress.user.score',
        'secondPlayerProgress.user.score',
        'firstPlayerProgress.answers',
        'secondPlayerProgress.answers',
        'questions',
      ],
    });
    if (!findedGame) {
      throw new NotFoundException(`Game with id ${id} not found`);
    }
    if (findedGame?.firstPlayerProgress?.userId !== user.id && findedGame?.secondPlayerProgress?.userId !== user.id) {
      throw new ForbiddenException('User is not participate');
    }
    return findedGame;
  }

  async findGamesByUser(user: UserEntity) {
    const findedGames = await this.gRepository.find({
      where: [
        { firstPlayerProgress: { userId: user.id } },
        { secondPlayerProgress: { userId: user.id } },
      ],
      relations: [
        'firstPlayerProgress.user',
        'secondPlayerProgress.user',
      ],
    });
    if (!findedGames.length) {
      throw new NotFoundException('No games found');
    }

    return findedGames;
  }

  async sendAnswer(answer: string, user: UserEntity) {
    let player: PlayerProgressEntity;
    let findedGame: GamePairEntity;
    try {
      findedGame = await this.getGame(user);
    } catch (e) {
      throw new ForbiddenException('No found game');
    }
    if (findedGame.status === GameStatuses.PendingSecondPlayer) {
      throw new ForbiddenException('No active pair');
    }
    if (findedGame?.firstPlayerProgress.userId !== user.id && findedGame?.secondPlayerProgress.userId !== user.id) {
      throw new ForbiddenException('User is not owner');
    }
    if (findedGame.firstPlayerProgress.userId === user.id) {
      player = findedGame.firstPlayerProgress;
    } else player = findedGame.secondPlayerProgress;
    if (player.answers.length >= 5) {
      throw new ForbiddenException('No more answers');
    }
    const newAnswer = new AnswerEntity();
    newAnswer.question = findedGame.questions![findedGame.questions!.length - 5 + player.answers.length];
    newAnswer.playerId = player.user.id;
    newAnswer.body = answer;
    if (newAnswer.question.correctAnswers.includes(newAnswer.body)) {
      player.score++;
      newAnswer.answerStatus = AnswerStatuses.Correct;
    } else {
      newAnswer.answerStatus = AnswerStatuses.Incorrect;
    }
    player.answers.push(newAnswer);

    let saveAnswer = await this.gRepository.save(findedGame);
    if (saveAnswer.firstPlayerProgress.answers.length === 5 && saveAnswer.secondPlayerProgress.answers.length === 5) {
      findedGame.status = GameStatuses.Finished;
      findedGame.finishGameDate = new Date(Date.now()).toISOString();
      const hasCorrectAnswerFirstPlayer = saveAnswer.firstPlayerProgress.answers.some(item => item.answerStatus === 'Correct');
      const hasCorrectAnswerSecondPlayer = saveAnswer.secondPlayerProgress.answers.some(item => item.answerStatus === 'Correct');
      if (
        Date.parse(saveAnswer.firstPlayerProgress.answers[
        saveAnswer.firstPlayerProgress.answers.length - 1
          ].addedAt)
        <
        Date.parse(saveAnswer.secondPlayerProgress.answers[
        saveAnswer.secondPlayerProgress.answers.length - 1
          ].addedAt) && hasCorrectAnswerFirstPlayer
      ) {
        findedGame.firstPlayerProgress.score++;
      }
      if (
        Date.parse(saveAnswer.secondPlayerProgress.answers[
        saveAnswer.secondPlayerProgress.answers.length - 1
          ].addedAt)
        <
        Date.parse(saveAnswer.firstPlayerProgress.answers[
        saveAnswer.firstPlayerProgress.answers.length - 1
          ].addedAt) && hasCorrectAnswerSecondPlayer
      ) {
        findedGame.secondPlayerProgress.score++;
      }
      saveAnswer = await this.gRepository.save(findedGame);
      const generateStatisticForFirstUser = await this.genStatHandler.generateStatisticForUser(findedGame.firstPlayerProgress.user)
      const generateStatisticForSecondUser = await this.genStatHandler.generateStatisticForUser(findedGame.secondPlayerProgress.user)
      Object.assign(saveAnswer.firstPlayerProgress.user.score, generateStatisticForFirstUser);
      Object.assign(saveAnswer.secondPlayerProgress.user.score, generateStatisticForSecondUser);
      await this.gRepository.save(saveAnswer)
    }
    if (findedGame.firstPlayerProgress.userId === user.id) {
      return saveAnswer.firstPlayerProgress.answers[saveAnswer.firstPlayerProgress.answers.length - 1].id;
    } else return saveAnswer.secondPlayerProgress.answers[saveAnswer.secondPlayerProgress.answers.length - 1].id;
  }

  //------------------------------------------------------------------------------------------//
  //-------------------------------------Questions--------------------------------------------//
  //------------------------------------------------------------------------------------------//

  async createQuestion(questionData: CreateQuestionInputModel): Promise<string> {
    const question = new QuestionEntity();
    question.body = questionData.body;
    question.correctAnswers = questionData.correctAnswers;
    const newQuestion = await this.questionRepository.save(question);
    return newQuestion.id;
  }

  async findQuestionById(id: string) {
    const findedQuestion = await this.questionRepository.findOne({
      where: { id },
    });
    if (!findedQuestion) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }
    return findedQuestion;
  }

  async updateQuestionById(id: string, questionData: Partial<CreateQuestionInputModel>) {
    const findedQuestion = await this.findQuestionById(id);
    Object.assign(findedQuestion, { ...questionData, updatedAt: new Date(Date.now()).toISOString() });
    return await this.questionRepository.save(findedQuestion);
  }

  async deleteQuestion(id: string) {
    const findedQuestion = await this.findQuestionById(id);
    return await this.questionRepository.delete(
      { id },
    );
  }

  async updateQuestionPublishStatus(id: string, updateData: UpdatePublishStatusInputModel) {
    const findedQuestion = await this.findQuestionById(id);
    findedQuestion.published = updateData.published;
    findedQuestion.updatedAt = new Date(Date.now()).toISOString();
    const updatedQuestion = await this.questionRepository.save(findedQuestion);
    return updatedQuestion;
  }

}
