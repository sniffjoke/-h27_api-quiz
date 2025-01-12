import { Column, Entity, Generated, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../users/domain/user.entity';


@Entity('devices')
export class DeviceEntity {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    userId: string;

    @Column()
    deviceId: string;

    @Column()
    ip: string;

    @Column()
    title: string;

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    lastActiveDate: string;

    @ManyToOne(() => UserEntity, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'userId'})
    user: UserEntity;

}
