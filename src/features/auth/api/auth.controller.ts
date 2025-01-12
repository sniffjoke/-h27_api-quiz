import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  EmailActivateDto,
  LoginDto,
  ResendActivateCodeDto,
} from './models/input/auth.input.model';
import { UserAgent } from '../../../core/decorators/common/user-agent.decorator';
import { CreateUserDto } from '../../users/api/models/input/create-user.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { CreateUserCommand } from '../../users/application/useCases/create-user.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { ActivateEmailCommand } from '../../users/application/useCases/activate-email.use-case';
import { ResendEmailCommand } from '../../users/application/useCases/resend-email.use-case';
import { LoginCommand } from '../application/useCases/login.use-case';
import { GetMeCommand } from '../application/useCases/get-me.use-case';
import { RefreshTokenCommand } from '../application/useCases/refresh-token.use-case';
import { LogoutCommand } from '../application/useCases/logout.use-case';
import { UsersQueryRepositoryTO } from '../../users/infrastructure/users.query-repositories.to';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly usersQueryRepository: UsersQueryRepositoryTO,
  ) {
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: Request) {
    const userData = await this.commandBus.execute(new GetMeCommand(req.headers.authorization as string));
    return userData;
  }

  @Post('login')
  @HttpCode(200)
  // @UseGuards(ThrottlerGuard)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
    @UserAgent() userAgent: string,
    @Req() req: Request,
  ) {
    const myIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const { accessToken, refreshToken } = await this.commandBus.execute(
      new LoginCommand(
        loginDto,
        // ip.address() as string,
        myIp as string,
        userAgent
      )
    );
    response.cookie('refreshToken', refreshToken, {
      secure: true,
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return {
      accessToken,
    };
  }

  @Post('registration')
  @HttpCode(204)
  // @UseGuards(ThrottlerGuard)
  async register(@Body() createUserDto: CreateUserDto) {
    const userId = await this.commandBus.execute(new CreateUserCommand(createUserDto, false))
    const newUser = await this.usersQueryRepository.userOutput(userId);
    return newUser;
  }

  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
    const { refreshToken, accessToken } = await this.commandBus.execute(new RefreshTokenCommand(req.cookies));
    response.cookie('refreshToken', refreshToken, {
      secure: true,
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return {
      accessToken,
    };
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
    const logoutUser = await this.commandBus.execute(new LogoutCommand(req.cookies));
    response.clearCookie('refreshToken');
    return logoutUser;
  }

  @Post('registration-confirmation')
  @HttpCode(204)
  // @UseGuards(ThrottlerGuard)
  async activateEmail(@Body() dto: EmailActivateDto) {
    const activateEmail = await this.commandBus.execute(new ActivateEmailCommand(dto.code));
    return activateEmail;
  }

  @Post('registration-email-resending')
  @HttpCode(204)
  // @UseGuards(ThrottlerGuard)
  async resendEmail(@Body() dto: ResendActivateCodeDto) {
    return await this.commandBus.execute(new ResendEmailCommand(dto.email));
  }

  // @Post('password-recovery')
  // @HttpCode(204)
  // async passwordRecovery(@Body() models: PasswordRecoveryDto) {
  //   return await this.usersService.passwordRecovery(models.email);
  // }
  //
  // @Post('new-password')
  // async newPasswordApprove(@Body() recoveryPasswordData: RecoveryPasswordModel) {
  //   return await this.usersService.approveNewPassword(recoveryPasswordData);
  // }

}
