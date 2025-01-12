import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn, JoinTable, ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GameStatuses } from '../api/models/input/create-pairs-status.input.model';
import { QuestionEntity } from './question.entity';
import { PlayerProgressEntity } from './player-progress.entity';

@Entity('gamePair')
export class GamePairEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => PlayerProgressEntity, (player) => player.gamePairFirstPlayer, {
    cascade: true,
  })
  @JoinColumn({ name: 'firstPlayerProgressId' })
  firstPlayerProgress: PlayerProgressEntity;

  @OneToOne(() => PlayerProgressEntity, (player) => player.gamePairSecondPlayer, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'secondPlayerProgressId' })
  secondPlayerProgress: PlayerProgressEntity;

  @Column()
  firstPlayerProgressId: number;

  @Column({ nullable: true, default: null })
  secondPlayerProgressId: number | null;

  @Column()
  status: GameStatuses;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  pairCreatedDate: string;

  @Column({ type: 'timestamp', nullable: true, default: null })
  startGameDate: string;

  @Column({ type: 'timestamp', nullable: true, default: null })
  finishGameDate: string;

  // @Column('text', { array: true })
  // questionsIds: string[]

  // @Column({ type: 'json', default: () => "'[]'" })
  // questions: { text: string; createdAt: string }[];

  @ManyToMany(() => QuestionEntity, (question) => question.gamePairs, {
    cascade: true,
    nullable: true
  })
  @JoinTable()
    // @JoinColumn({name: 'questionsIds'})
  questions: QuestionEntity[] | null;
}
