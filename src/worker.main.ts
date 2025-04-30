import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';
import { ConsoleLogger, Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(WorkerModule, {
    logger: new ConsoleLogger({
      json: true,
      colors: true,
    }),
  });
  await app.init();
  const logger = new Logger('Worker Bootstrap');
  logger.log('Worker started. Waiting to process jobs');
}
bootstrap();
