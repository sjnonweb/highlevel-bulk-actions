import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(WorkerModule);
  await app.init();
  const logger = new Logger('Worker Bootstrap');
  logger.log('Worker started. Waiting to process jobs');
}
bootstrap();
