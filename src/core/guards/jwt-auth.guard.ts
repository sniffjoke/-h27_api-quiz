import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../settings/env/configuration';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService<ConfigurationType, true>
  ) {
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authHeader = req.headers.authorization;
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];
      const apiSettings = this.configService.get('apiSettings', {
        infer: true,
      });
      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException({ message: 'User not logged in' });
      }
      const user = this.jwtService.verify(token, { secret: apiSettings.JWT_SECRET_ACCESS_TOKEN });
      req.user = user;
      return true;
    } catch (e: any) {
      throw new UnauthorizedException({ message: 'User not logged in.' });
    }
  }
}
