import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';


@Injectable()
export class TokensRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
  }

  async findToken(filter: any) {
    const findedToken = await this.dataSource.query(
      'SELECT * FROM tokens WHERE "deviceId" = $1',
      [filter.deviceId],
    );
    if (!findedToken.length) {
      throw new NotFoundException('Invalid deviceId');
    }
    return findedToken[0];
  }

  async findTokenByRToken(filter: any) {
    const findedToken = await this.dataSource.query(
      'SELECT * FROM tokens WHERE "refreshToken" = $1',
      [filter.refreshToken],
    );
    if (!findedToken.length) {
      throw new NotFoundException('Invalid refreshToken');
    }
    return findedToken[0];
  }

  // Update status tokens for devices

  async updateStatusTokensInDb(filter: any) {
    return await this.dataSource.query(
      `
                UPDATE tokens SET "blackList" = true WHERE "deviceId" = $1
            `,
      [
        filter.deviceId
      ]
    );
  }

  async updateStatusTokensAfterDeleteAllInDb(filter: any) {
    return await this.dataSource.query(
      `
                UPDATE tokens 
                SET "blackList" = true 
                WHERE "deviceId" <> $1 AND "userId" = $2`
      ,
      [
        filter.deviceId,
        filter.userId,
      ],
    );
  }

  // Update status tokens after refresh tokens

  async updateStatusRTokensInDb(filter: any) {
    return await this.dataSource.query(
      `
                UPDATE tokens
                SET "blackList" = true 
                WHERE "refreshToken" = $1
            `,
      [filter.refreshToken]);
  }

  async createToken(tokenData: any) {
    const result = await this.dataSource.query(
      `
            INSERT INTO tokens ("userId", "deviceId", "refreshToken", "blackList")
            VALUES ($1, $2, $3, $4) 
            RETURNING *
            `,
      [
        tokenData.userId,
        tokenData.deviceId,
        tokenData.refreshToken,
        tokenData.blackList,
      ]);
    return result;
  }

}
