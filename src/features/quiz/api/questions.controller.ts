import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Put,
  HttpCode,
} from '@nestjs/common';
import { QuizService } from '../application/quiz.service';
import { QuizQueryRepositoryTO } from '../infrastructure/quiz.query-repository.to';
import { CreateQuestionInputModel } from './models/input/create-question.input.model';
import { BasicAuthGuard } from '../../../core/guards/basic-auth.guard';
import { UpdatePublishStatusInputModel } from './models/input/update-publish-status.input.model';

@Controller('sa/quiz')
export class QuestionsController {
  constructor(
    private readonly quizService: QuizService,
    private readonly quizQueryRepository: QuizQueryRepositoryTO,
  ) {
  }

  @Post('questions')
  @UseGuards(BasicAuthGuard)
  async createNewQuestion(@Body() questionData: CreateQuestionInputModel) {
    const newQuestionId = await this.quizService.createNewQuestion(questionData);
    return await this.quizQueryRepository.questionOutput(newQuestionId)
  }

  @Get('questions')
  @UseGuards(BasicAuthGuard)
  async getAllQuestionsWithQueryData(@Query() query: any) {
    return await this.quizQueryRepository.getAllQuestionsWithQuery(query);
  }

  @Put('questions/:id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async updateQuestion(@Body() questionData: CreateQuestionInputModel, @Param('id') id: string) {
    return await this.quizService.updateQuestionById(id, questionData);
  }

  @Delete('questions/:id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async createQuestion(@Param('id') id: string) {
    return await this.quizService.deleteQuestion(id);
  }

  @Put('questions/:id/publish')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async changePublishStatus(@Body() updateData: UpdatePublishStatusInputModel, @Param('id') id: string) {
    return await this.quizService.updateQuestionPublish(id, updateData);
  }

  // @Get('pairs/:id')
  // async getGameById(@Param('id') id: string) {
  //   return await this.quizService.findGameById(id);
  // }
  //

  //
  // @Post('pairs/my-current/answers')
  // sendAnswer(@Body() answerData: CreateAnswerInputModel, @Req() req: Request) {
  //   return this.quizService.sendAnswer(answerData, req.headers.authorization as string);
  // }

}
