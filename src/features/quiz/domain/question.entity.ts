import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn, ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { GamePairEntity } from './game-pair.entity';
import { AnswerEntity } from './answer.entity';


@Entity('question')
export class QuestionEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  body: string


  @Column('text', {array: true})
  correctAnswers: string[];

  @Column({default: false})
  published: boolean

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;

  @Column({ type: 'timestamp', nullable: true, default: null })
  updatedAt: string;

  @ManyToMany(() => GamePairEntity, (gamePair) => gamePair.questions)
  gamePairs: GamePairEntity[];

}

