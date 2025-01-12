import { UserEntity } from '../../users/domain/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamePairEntity } from './game-pair.entity';

export class GenerateStatisticHandler {
  constructor(
    @InjectRepository(GamePairEntity) private readonly gRepository: Repository<GamePairEntity>,
  ) {
  }

  async generateStatisticForUser(user: UserEntity) {
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
    let sumScore = 0;
    let wins = 0;
    let loses = 0;
    let draws = 0;
    findedGames.map(game => {
      if (game.firstPlayerProgress.userId === user.id) {
        sumScore = sumScore + game.firstPlayerProgress.score;
      } else if (game.secondPlayerProgress.userId === user.id) {
        sumScore = sumScore + game.secondPlayerProgress.score;
      }
      if (game.firstPlayerProgress.score === game.secondPlayerProgress.score) {
        draws += 1;
      }
      if (game.firstPlayerProgress.userId === user.id &&
        game.firstPlayerProgress.score > game.secondPlayerProgress.score) {
        wins += 1;
      } else if (game.firstPlayerProgress.userId === user.id &&
        game.firstPlayerProgress.score < game.secondPlayerProgress.score) {
        loses += 1;
      }
      if (game.secondPlayerProgress.userId === user.id &&
        game.secondPlayerProgress.score > game.firstPlayerProgress.score) {
        wins += 1;
      } else if (game.secondPlayerProgress.userId === user.id &&
        game.secondPlayerProgress.score < game.firstPlayerProgress.score) {
        loses += 1;
      }
    });
    const gamesCount = findedGames.length;
    const avgScores = Number((sumScore/gamesCount).toFixed(2));
    return {
      sumScore,
      avgScores,
      gamesCount,
      winsCount: wins,
      lossesCount: loses,
      drawsCount: draws,
      userId: user.id
    };
  }

}
