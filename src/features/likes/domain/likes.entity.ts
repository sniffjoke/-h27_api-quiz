import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PostEntity } from '../../posts/domain/posts.entity';
import { LikeStatus } from '../../posts/api/models/output/post.view.model';
import { CommentEntity } from '../../comments/domain/comment.entity';
import { UserEntity } from '../../users/domain/user.entity';


@Entity('likes')
export class LikeEntity {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    userId: string;

    @Column({nullable: true})
    commentId: string;

    @Column({nullable: true})
    postId: string;

    @Column()
    status: LikeStatus;

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    addedAt: string;

    @ManyToOne(() => PostEntity, (post) => post.likes, { onDelete: 'SET NULL' })
    @JoinColumn({name: 'postId'})
    post: PostEntity

    @ManyToOne(() => CommentEntity, (comment) => comment.likes, { onDelete: 'SET NULL' })
    @JoinColumn({name: 'commentId'})
    comment: CommentEntity

    @ManyToOne(() => UserEntity, (user) => user.likes, { cascade: true })
    @JoinColumn({name: 'userId'})
    user: UserEntity

}
