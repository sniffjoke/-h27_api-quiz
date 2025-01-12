import { CreateUserUseCase } from './create-user.use-case';
import { DeleteUserUseCase } from './delete-user.use-case';
import { ActivateEmailUseCase } from './activate-email.use-case';
import { ResendEmailUseCase } from './resend-email.use-case';

export const UsersCommandHandlers = [CreateUserUseCase, DeleteUserUseCase, ActivateEmailUseCase, ResendEmailUseCase];
