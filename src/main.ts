import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configSwagger } from './configs/swagger';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { LoggerService } from '@shared/logger/logger.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ERRORS_DICTIONARY } from './constants/error-dictionary.constant';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
  });

  global.baseDir = path.join(__dirname, '../');
  app.enableCors({
    origin: '*',
  });
  app.setGlobalPrefix('/api/');
  const logger = app.get(LoggerService);
  configSwagger(app);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: (errors: ValidationError[]) =>
        new BadRequestException({
          message: ERRORS_DICTIONARY.VALIDATION_ERROR,
          details: errors
            .map((error) => Object.values(error.constraints))
            .flat(),
        }),
    }),
  );
  const port = process.env.PORT || 3001;
  await app.listen(port, () => {
    logger.info(`Application running on port ${port}`);
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error(error);
  });
}
bootstrap();
