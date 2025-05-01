import { NestFactory } from '@nestjs/core';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { createRootModule } from './root.module';
import { AppMode } from './common/enums/app-mode.enum';

async function bootstrap() {
  const RootModule = createRootModule(AppMode.API);
  const app = await NestFactory.create(RootModule, {
    logger: new ConsoleLogger({
      json: true,
      colors: true,
    }),
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
