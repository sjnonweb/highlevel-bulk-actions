import { NestFactory } from '@nestjs/core';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { createRootModule } from './root.module';
import { AppMode } from './common/enums/app-mode.enum';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const RootModule = createRootModule(AppMode.API);
  const app = await NestFactory.create(RootModule, {
    logger: new ConsoleLogger({
      json: true,
      colors: true,
    }),
  });
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }));

  // swagger doc config
  const config = new DocumentBuilder()
    .setTitle('Highlevel bulk-action')
    .setDescription('Bulk action processing service for Highlevel')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
