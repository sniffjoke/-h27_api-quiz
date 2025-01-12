import { IsString, Length } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transform/trim';

export class CommentCreateModel {
    @Trim()
    @IsString({message: 'Должно быть строковым значением'})
    @Length(20, 300, {message: 'Количество знаков 20-300'})
    content: string
}
