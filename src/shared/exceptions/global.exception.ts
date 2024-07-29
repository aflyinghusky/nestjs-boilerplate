import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@shared/logger/logger.service';
import { Response } from 'express';
import { ERRORS_DICTIONARY } from 'src/constants/error-dictionary.constant';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly config_service: ConfigService,
    private readonly logger: LoggerService,
  ) {}
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    this.logger.error(exception);
    const error_object = {
      error_code: ERRORS_DICTIONARY.INTERNAL_SERVER_ERROR,
      error_message: 'Internal server error',
      status_code: 500,
    };

    if (exception instanceof HttpException) {
      const message = exception.getResponse();
      error_object.status_code = exception.getStatus();
      error_object.error_code = message['code'];
      error_object.error_message = message['message'];
    } else {
      this.logger.logExternal(exception);
      if (exception instanceof Error) {
        error_object.error_message = exception.message;
      } else {
        error_object.error_message = exception;
      }
    }

    response.status(error_object.status_code).json({
      error_code: error_object.error_code,
      error_message: error_object.error_message,
      success: false,
      error:
        this.config_service.get('ENV') !== 'dev'
          ? {
              response: exception.response,
              stack: exception.stack,
            }
          : undefined,
    });
  }
}
