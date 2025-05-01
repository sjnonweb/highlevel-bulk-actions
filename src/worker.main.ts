import { NestFactory } from '@nestjs/core';
import { ConsoleLogger, Logger } from '@nestjs/common';
import { createRootModule } from './root.module';
import { AppMode } from './common/enums/app-mode.enum';

async function bootstrap() {
  const RootModule = createRootModule(AppMode.WORKER)
  const app = await NestFactory.create(RootModule, {
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
