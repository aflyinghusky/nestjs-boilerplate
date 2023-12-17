import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configSwagger } from './configs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './shared/exceptions/http.exception';
import { LoggerService } from '@shared/logger/logger.service';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
  });

  global.baseDir = path.join(__dirname, '../');
  app.enableCors({
    origin: '*',
  });
  app.useGlobalFilters(new HttpExceptionFilter());
	app.setGlobalPrefix('/api/');
	const logger = app.get(LoggerService);
  configSwagger(app);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
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
