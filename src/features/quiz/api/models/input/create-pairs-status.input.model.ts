import { Matches } from 'class-validator';

export enum GameStatuses {
  PendingSecondPlayer = 'PendingSecondPlayer',
  Active = 'Active',
  Finished = 'Finished'
}

export enum AnswerStatuses {
  Correct = 'Correct',
  Incorrect = 'Incorrect'
}

export class CreatePairStatusInputModel {
  @Matches(/\b(?:PendingSecondPlayer|Active|Finished)\b/)
  status: GameStatuses
}

export class CreateAnswerStatusInputModel {
  @Matches(/\b(?:Correct|Incorrect)\b/)
  answerStatus: AnswerStatuses
}
