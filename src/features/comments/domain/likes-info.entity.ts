import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { CommentEntity } from './comment.entity';

@Entity('likesInfo')
export class LikesInfoEntity {

  @PrimaryColumn()
  commentId: string


  @Column({default: 0})
  likesCount: number;

  @Column({default: 0})
  dislikesCount: number

  @OneToOne(() => CommentEntity, (comment) => comment.likesInfo, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'commentId'})
  comment: CommentEntity;

}
