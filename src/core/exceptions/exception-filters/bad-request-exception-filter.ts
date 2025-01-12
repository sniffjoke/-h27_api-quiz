import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';


@Catch()
export class BadRequestExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    // console.log('error: ', exception.getResponse());
    const status = exception.getStatus();
    const responseBody: any = exception.getResponse();
    if  (responseBody.statusCode === 404) {
      console.log(request.url, request.method);
    }
    const errorsResponse: any = {
      errorsMessages: [],
    };
    if (Array.isArray(responseBody.message)) { // Bad Request
      responseBody.message.forEach((msg) => {
          errorsResponse.errorsMessages.push(msg);
        },
      );
      response.status(status).send(errorsResponse);
    } else if (responseBody.statusCode === 400 && !Array.isArray(responseBody.message)) {
      errorsResponse.errorsMessages.push({
        message: responseBody.message,
        field: responseBody.message.split(' ')[0].toLowerCase().toString() });
      response.status(status).send(errorsResponse)
    } else {
      response.status(status).send(responseBody);
    }
  }
}
