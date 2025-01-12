import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  Query
} from '@nestjs/common';
import { CreateUserDto } from './models/input/create-user.dto';
import { BasicAuthGuard } from '../../../core/guards/basic-auth.guard';
import { CreateUserCommand } from '../application/useCases/create-user.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteUserCommand } from '../application/useCases/delete-user.use-case';
import { UsersQueryRepositoryTO } from '../infrastructure/users.query-repositories.to';

@Controller('sa')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly usersQueryRepository: UsersQueryRepositoryTO,
  ) {
  }

  @Post('users')
  @UseGuards(BasicAuthGuard)
  async create(@Body() createUserDto: CreateUserDto) {
    const userId = await this.commandBus.execute(new CreateUserCommand({...createUserDto}, true))
    const user = await this.usersQueryRepository.userOutput(userId)
    return user
  }

  @Get('users')
  @UseGuards(BasicAuthGuard)
  async findAll(@Query() query: any) {
    const usersWithQuery = await this.usersQueryRepository.getAllUsersWithQuery(query)
    return usersWithQuery
  }



  @Delete('users/:id')
  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  remove(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteUserCommand(id))
  }
}
