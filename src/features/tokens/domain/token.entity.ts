    import {
    Column,
    Entity,
        Generated,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';
    import { UserEntity } from '../../users/domain/user.entity';
    import { DeviceEntity } from '../../devices/domain/devices.entity';


@Entity('tokens')
export class TokenEntity {

    @PrimaryGeneratedColumn()
    id: string

    @Column()
    userId: string;

    @Column()
    deviceId: string;

//TODO iat
    @Column()
    refreshToken: string;

    @Column()
    blackList: boolean;

    @ManyToOne(() => UserEntity, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'userId'})
    user: UserEntity;

    // @ManyToOne(() => DeviceEntity, {onDelete: 'CASCADE'})
    // @JoinColumn({name: 'deviceId'})
    // device: DeviceEntity;

}
