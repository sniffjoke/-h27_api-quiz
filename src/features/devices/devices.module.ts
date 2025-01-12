import { Module } from '@nestjs/common';
import { DevicesController } from './api/devices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokensModule } from '../tokens/tokens.module';
import { UsersModule } from '../users/users.module';
import { DevicesCommandHandlers } from './application/useCases';
import { DevicesRepositoryTO } from './infrastructure/devices.repository.to';
import { DeviceEntity } from './domain/devices.entity';

@Module({
  imports: [
    UsersModule,
    TokensModule,
    TypeOrmModule.forFeature([DeviceEntity]),
  ],
  controllers: [DevicesController],
  providers: [
    DevicesRepositoryTO,
    ...DevicesCommandHandlers,
  ],
  exports: [
    DevicesRepositoryTO,
    ...DevicesCommandHandlers,
  ],
})
export class DevicesModule {
}
