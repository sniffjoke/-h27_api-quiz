import { Module } from "@nestjs/common";
import { TokensService } from "./application/tokens.service";
import { JwtModule} from "@nestjs/jwt";
import { TypeOrmModule } from '@nestjs/typeorm';
import { UuidModule } from 'nestjs-uuid';
import { TokensRepositoryTO } from './infrastructure/tokens.repository.to';
import { TokenEntity } from './domain/token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TokenEntity]),
    JwtModule.register({global: true}),
    UuidModule
  ],
  controllers: [],
  providers: [
    TokensService,
    TokensRepositoryTO
  ],
  exports: [
    TokensService,
    JwtModule,
    TokensRepositoryTO
  ]
})
export class TokensModule {}
