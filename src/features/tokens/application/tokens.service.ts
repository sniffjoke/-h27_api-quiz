import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../core/settings/env/configuration';
import { UuidService } from 'nestjs-uuid';

@Injectable()
export class TokensService {
  // apiSettings
  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService<ConfigurationType, true>,
    private readonly uuidService: UuidService,
  ) {
    // const apiSettings = this.configService.get('apiSettings', {
    //   infer: true,
    // });
  }

  createTokens(userId: string, deviceId?: string) {
    const apiSettings = this.configService.get('apiSettings', {
      infer: true,
    });
    const [accessToken, refreshToken] = [
      this.jwtService.sign(
        {
          _id: userId,
          uuid: this.uuidService.generate()
        },
        {
          secret: apiSettings.JWT_SECRET_ACCESS_TOKEN,
          expiresIn: "1000s"
        }
      ),
      this.jwtService.sign(
        {
          _id: userId,
          deviceId,
          uuid: this.uuidService.generate()
        },
        {
          secret: apiSettings.JWT_SECRET_REFRESH_TOKEN,
          expiresIn: "2000s"
        }
      )
    ];
    return {
      accessToken,
      refreshToken
    };
  }

  validateAccessToken(token: string) {
    const apiSettings = this.configService.get('apiSettings', {
      infer: true,
    });
    try {
      const userData = this.jwtService.verify(
        token,
        { secret: apiSettings.JWT_SECRET_ACCESS_TOKEN }
      );
      return userData;
    } catch (e) {
      return null;
    }
  }

  validateRefreshToken(token: string) {
    const apiSettings = this.configService.get('apiSettings', {
      infer: true,
    });
    try {
      const userData = this.jwtService.verify(
        token,
        { secret: apiSettings.JWT_SECRET_REFRESH_TOKEN }
      );
      return userData;
    } catch (e) {
      return null;
    }
  }
  getToken(bearerHeader: string) {
    const token = bearerHeader.split(" ")[1];
    return token;
  }

  getTokenFromCookie(bearerHeaderR: any) {
    const tokenValue = Object.values(bearerHeaderR)
    return tokenValue[0] as string;
  }

  decodeToken(token: string) {
    return this.jwtService.decode(token);
  }

}
