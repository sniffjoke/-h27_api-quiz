import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { TokenEntity } from '../domain/token.entity';


@Injectable()
export class TokensRepositoryTO {
  constructor(
    @InjectRepository(TokenEntity) private readonly tRepository: Repository<TokenEntity>,
  ) {
  }

  async findToken(filter: any) {
    const findedToken = await this.tRepository.findOne(
      { where: { deviceId: filter.deviceId } },
    );
    if (!findedToken) {
      throw new NotFoundException('Invalid deviceId');
    }
    return findedToken;
  }

  async findTokenByRToken(filter: any) {
    const findedToken = await this.tRepository.findOne(
      { where: { refreshToken: filter.refreshToken } },
    );
    if (!findedToken) {
      throw new NotFoundException('Invalid refreshToken');
    }
    return findedToken;
  }

  // Update status tokens for devices

  async updateStatusTokensInDb(filter: any) {
    return await this.tRepository.update(
      { deviceId: filter.deviceId },
      { blackList: true },
    );
  }

  async updateStatusTokensAfterDeleteAllInDb(filter: any) {
    return await this.tRepository.update(
      { deviceId: Not(filter.deviceId), userId: filter.userId },
      { blackList: true },
    );
  }

  // Update status tokens after refresh tokens

  async updateStatusRTokensInDb(filter: any) {
    return await this.tRepository.update(
      { refreshToken: filter.refreshToken },
      { blackList: true },
    );
  }

  async createToken(tokenData: any) {
    const result = await this.tRepository.save(
      tokenData,
    );
    return result;
  }

}
