import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../../users/domain/user.entity';


@Entity('userScore')
export class UserScoreEntity {

  @PrimaryColumn()
  userId: string


  @Column({default: 0})
  sumScore: number;

  @Column('double precision', {default: 0})
  avgScores: number;

  @Column({default: 0})
  gamesCount: number;

  @Column({default: 0})
  winsCount: number;

  @Column({default: 0})
  lossesCount: number;

  @Column({default: 0})
  drawsCount: number;

  @OneToOne(() => UserEntity, (user) => user.score, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'userId'})
  user: UserEntity;

}
