import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule} from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './features/users/users.module';
import { TestingModule } from './features/testing/testing.module';
import { TokensModule } from './features/tokens/tokens.module';
import { DevicesModule } from './features/devices/devices.module';
import { AuthModule } from './features/auth/auth.module';
import { UserIsExistConstraint } from './core/decorators/async/user-is-exist.decorator';
import { BlogsModule } from './features/blogs/blogs.module';
import { CqrsModule } from '@nestjs/cqrs';
import { Environments } from './core/settings/env/env-settings';
import  { TypeOrmConfigService } from './core/settings/database.config';
import { MailSendModule } from './core/settings/mailer.module';
import configuration, { validate } from './core/settings/env/configuration';
import { QuizModule } from './features/quiz/quiz.module';

@Module({
  imports: [
    CqrsModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 10000,
      limit: 5,
    }]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      ignoreEnvFile:
        process.env.ENV !== Environments.DEVELOPMENT &&
        process.env.ENV !== Environments.TEST,
      envFilePath: "." + `${process.env.ENV}`.toLowerCase() + ".env"
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      inject: [TypeOrmConfigService]
    }),
    MailSendModule,
    BlogsModule,
    UsersModule,
    TestingModule,
    AuthModule,
    TokensModule,
    DevicesModule,
    QuizModule
  ],
  controllers: [],
  providers: [
    UserIsExistConstraint,
  ],
})
export class AppModule {
}
