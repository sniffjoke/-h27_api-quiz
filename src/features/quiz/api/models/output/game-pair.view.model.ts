import { GameStatuses } from '../input/create-pairs-status.input.model';
import { PlayerProgressViewModel } from './player-progress.view.model';
import { QuestionViewModel, QuestionViewModelForPairs } from './question.view.model';

export class GamePairViewModel {
  id: string
  firstPlayerProgress: PlayerProgressViewModel
  secondPlayerProgress: PlayerProgressViewModel | null
  questions: QuestionViewModelForPairs[] | null
  status: GameStatuses
  pairCreatedDate: string
  startGameDate: string
  finishGameDate: string
}
