import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PostEntity } from '../../posts/domain/posts.entity';
import { UserEntity } from '../../users/domain/user.entity';
import { LikesInfo } from '../api/models/output/comment.view.model';
import { LikesInfoEntity } from './likes-info.entity';
import { LikeEntity } from '../../likes/domain/likes.entity';


@Entity('comments')
export class CommentEntity {

  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  content: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;

  @Column()
  postId: string;

  @Column()
  userId: string;

  @ManyToOne(() => PostEntity, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: PostEntity;

  @ManyToOne(() => UserEntity, (user) => user.comments, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @OneToOne(() => LikesInfoEntity, (likesInfo) => likesInfo.comment, {cascade: true} )
  likesInfo: LikesInfoEntity

  @OneToMany(() => LikeEntity, (like) => like.comment, {cascade: true})
  likes: LikeEntity[];

}
