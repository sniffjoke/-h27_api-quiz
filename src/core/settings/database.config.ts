import {Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import {TypeOrmModuleOptions} from '@nestjs/typeorm'
import { ConfigurationType } from "./env/configuration";

@Injectable()
export class TypeOrmConfigService {
    constructor(protected readonly configService: ConfigService<ConfigurationType, true>) {}
    createTypeOrmOptions(): TypeOrmModuleOptions {
        const {configService} = this
        const databaseSettings = configService.get('databaseSettings', { infer: true });
        return {
            type: 'postgres',
            host: databaseSettings.DB_HOST,
            port: Number(databaseSettings.DB_PORT),
            username: databaseSettings.DB_USERNAME,
            password: databaseSettings.DB_PASSWORD,
            database: databaseSettings.DATABASE_NAME,
            ssl: databaseSettings.SSL_CONNECTION === '1',
            autoLoadEntities: true,
            synchronize: true
        }
    }
}


