import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokensModule } from '../tokens/tokens.module';
import { DevicesModule } from '../devices/devices.module';
import { AuthCommandHandlers } from './application/useCases';

@Module({
  imports: [
    DevicesModule,
    TokensModule,
    UsersModule,
    TypeOrmModule.forFeature([]),
  ],
  controllers: [AuthController],
  providers: [...AuthCommandHandlers],
})
export class AuthModule {
}
