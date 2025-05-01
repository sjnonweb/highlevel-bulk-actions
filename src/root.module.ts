import { DynamicModule, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ContactsModule } from './contacts/contacts.module';
import { BulkActionModule } from './bulk-action/bulk-action.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BulkAction } from './bulk-action/entities/bulk-action.entity';
import { BulkActionBatch } from './bulk-action/entities/bulk-action-batch.entity';
import { BulkActionItem } from './bulk-action/entities/bulk-action-items.entity';
import { Contact } from './contacts/entities/contact.entity';
import { BullModule } from '@nestjs/bullmq';
import { BulkActionWorker } from 'src/workers/bulk-action.worker';
import { AppMode } from './common/enums/app-mode.enum';

export function createRootModule(mode: AppMode): DynamicModule {
  return {
    module: class RootModule {},
    imports: createImports(),
    providers: createProviders(mode),
    controllers: [],
    exports: [],
  };
}

function createProviders(mode: AppMode) {
  const providers: Provider[] = [];
  if (mode == AppMode.WORKER) {
    providers.push(BulkActionWorker);
  }
  return providers;
}

function createImports() {
  return [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        database: configService.get('DB_NAME'),
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        synchronize: configService.get('DB_SYNC'),
        entities: [
          BulkAction,
          BulkActionBatch,
          BulkActionItem,
          Contact,
        ],
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
    }),
    BulkActionModule,
    ContactsModule,
  ];
}
