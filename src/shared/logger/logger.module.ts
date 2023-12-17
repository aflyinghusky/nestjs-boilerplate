import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [LoggerService],
  imports: [ConfigModule],
})
export class LoggerModule {}
