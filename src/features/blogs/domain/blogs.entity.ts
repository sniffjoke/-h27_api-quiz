import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PostEntity } from '../../posts/domain/posts.entity';


@Entity('blogs')
export class BlogEntity {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    websiteUrl: string;

    @Column({default: false})
    isMembership: boolean;

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createdAt: string;

    @OneToMany(() => PostEntity, (post) => post.blog, { cascade: true })
    posts: PostEntity[]

}
