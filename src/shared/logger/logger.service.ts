import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { loggerOptions } from '@configs/winston-logger.config';
import { ConfigService } from '@nestjs/config';
import { TelegramLogger } from './telegram/telegram.logger';

@Injectable()
export class LoggerService {
  private readonly logger;
  private readonly telegramLogger: TelegramLogger;
  private readonly whitelistEnvs = ['prod', 'staging', 'test', 'dev'];
  private shouldFireExternal: boolean;

  constructor(private readonly configService: ConfigService) {
    this.logger = winston.createLogger(loggerOptions);

    this.telegramLogger = new TelegramLogger(
      this.configService.get('logging.tg_token'),
      this.configService.get('logging.tg_channel'),
      this.configService.get('app.service_name'),
      this.configService.get('app.nodeEnv'),
    );
    this.shouldFireExternal = this.whitelistEnvs.includes(
      this.configService.get('app.nodeEnv'),
    );
  }

  error(error: any, context?: string) {
    if (!error) return;
    const errorMessage = typeof error == 'object' ? error.message : error;
    const logMessage = context
      ? `${context}: message: ${errorMessage}\n[Stack]: ${
          error instanceof Error ? error.stack : ''
        }`
      : `message: ${errorMessage}${
          error instanceof Error ? `\n[Stack]: ${error.stack}` : ''
        }`;

    if (this.shouldFireExternal) {
      this.telegramLogger.sendMessage(logMessage);
    }
    this.logger.error(logMessage);
  }

  info(message: any) {
    this.logger.info(`message: ${message}`);
  }

  log(message: any) {
    this.logger.info(`message: ${message}`);
  }

  warn(message: any) {
    this.logger.warn(`message: ${message}`);
  }
}
