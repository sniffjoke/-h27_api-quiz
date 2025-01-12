import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from "rxjs";
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../settings/env/configuration';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>
  ) {
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authHeader = req.headers.authorization;
      const basic = authHeader.split(" ")[0];
      const token = authHeader.split(" ")[1];
      if (basic !== "Basic" || !token) {
        throw new UnauthorizedException({ message: "User not logged in" });
      }
      const apiSettings = this.configService.get('apiSettings', {
        infer: true,
      });
      const decodeAuth = Buffer.from(token, "base64").toString("base64");
      const verifyAuth = Buffer.from(apiSettings.ADMIN, "utf-8").toString("base64");
      if (verifyAuth !== decodeAuth) {
        throw new UnauthorizedException({ message: "User not logged in" });
      }
      return true;
    } catch (e: any) {
      throw new UnauthorizedException({ message: "User not logged in." });
    }
  }
}
