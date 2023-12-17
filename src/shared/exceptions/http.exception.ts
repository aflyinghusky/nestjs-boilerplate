import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    BadRequestException,
    NotFoundException,
    HttpStatus,
    UnauthorizedException,
    ForbiddenException,
    Logger,
  } from '@nestjs/common';
  import { Response } from 'express';
  const logger = new Logger();
  
  @Catch()
  export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      let errorObject = {
        statusCode: 500,
        message: 'Something went wrong',
        error: 'Internal Server Error',
      } as any;
      logger.error(exception.message, exception.stack);
      try {
        if (exception instanceof BadRequestException) {
          errorObject = exception.getResponse();
          return response.status(HttpStatus.BAD_REQUEST).json(errorObject);
        }
  
        if (exception instanceof NotFoundException) {
          errorObject = exception.getResponse();
          return response.status(HttpStatus.NOT_FOUND).json(errorObject);
        }
  
        if (exception instanceof UnauthorizedException) {
          errorObject = exception.getResponse();
          return response.status(HttpStatus.UNAUTHORIZED).json(errorObject);
        }
  
        if (exception instanceof ForbiddenException) {
          errorObject = exception.getResponse();
          return response.status(HttpStatus.FORBIDDEN).json(errorObject);
        }
  
        if (typeof exception === 'object') {
          const errorCode = exception.statusCode || exception.code;
  
          errorObject.statusCode = errorCode;
  
          if (
            typeof errorCode !== 'number' ||
            !Object.values(HttpStatus).includes(errorCode)
          ) {
            errorObject.statusCode = 500;
          }
  
          errorObject.message = exception.message || 'Unknown Error';
        }
  
        if (errorObject.statusCode === 404) {
          errorObject.error = 'NotFound';
        }
        response.status(errorObject.statusCode).json(errorObject);
      } catch (error) {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: 500,
          message: 'Something went wrong',
          error: 'Internal Server Error',
        });
      }
    }
  }
  