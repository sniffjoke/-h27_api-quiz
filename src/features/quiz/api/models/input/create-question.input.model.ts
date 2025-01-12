import { IsString, Length } from 'class-validator';

export class CreateQuestionInputModel {
  @IsString({message: 'Должно быть строковым значением'})
  @Length(10, 500, {message: 'Количество знаков 10-500'})
  body: string
  correctAnswers: string[]
}
