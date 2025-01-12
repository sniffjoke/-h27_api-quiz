import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { AnswerStatuses } from '../api/models/input/create-pairs-status.input.model';
import { QuestionEntity } from './question.entity';
import { PlayerProgressEntity } from './player-progress.entity';


@Entity('answer')
export class AnswerEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  questionId: string;

  @Column()
  playerId: string;

  @Column()
  body: string

  @Column()
  answerStatus: AnswerStatuses

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  addedAt: string

  @ManyToOne(() => QuestionEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'questionId' })
  question: QuestionEntity;

  @ManyToOne(() => PlayerProgressEntity, (playerProgress) => playerProgress.answers,  { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'playerId' })
  playerProgress: PlayerProgressEntity;

}
