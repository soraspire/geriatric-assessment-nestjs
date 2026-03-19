import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (exception instanceof BadRequestException) {
      const responseBody: any = exception.getResponse();
      if (responseBody.isValidationError) {
        // @ts-ignore
        request.session.errors = responseBody.errorMessages;
        // @ts-ignore
        request.session.old = request.body;
        // @ts-ignore
        return request.session.save(() => {
          response.redirect('/assessments/create');
        });
      }
    }

    // Default behavior for other exceptions
    response.status(status).json(exception.getResponse());
  }
}
