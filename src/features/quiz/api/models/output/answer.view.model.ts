import { AnswerStatuses } from '../input/create-pairs-status.input.model';


export class AnswerViewModel {
  questionId: string;
  answerStatus: AnswerStatuses;
  addedAt: string
}

export class AnswerViewModelForPairs {
  questionId: string;
  answerStatus: AnswerStatuses;
  addedAt: string
}
