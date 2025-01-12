import { PlayerViewModel } from './player.view.model';
import { AnswerViewModel } from './answer.view.model';


export class PlayerProgressViewModel {
  answers: AnswerViewModel[] | []
  player: PlayerViewModel
  score: number
}
