import { GetMeUseCase } from './get-me.use-case';
import { LoginUseCase } from './login.use-case';
import { LogoutUseCase } from './logout.use-case';
import { RefreshTokenUseCase } from './refresh-token.use-case';

export const AuthCommandHandlers = [GetMeUseCase, LoginUseCase, LogoutUseCase, RefreshTokenUseCase];
