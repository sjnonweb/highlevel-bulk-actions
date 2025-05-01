import { Module } from '@nestjs/common';
import { BulkActionController } from './bulk-action.controller';
import { BulkActionService } from './bulk-action.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BulkAction } from './entities/bulk-action.entity';
import { BullModule } from '@nestjs/bullmq';
import { ContactBulkActionProcessor } from './processors/contact.processor';
import { ContactsModule } from 'src/contacts/contacts.module';

export const BULK_PROCESSORS = 'BULK_PROCESSORS';

@Module({
  imports: [
    TypeOrmModule.forFeature([BulkAction]),
    BullModule.registerQueue(
      { name: 'bulk-action' },
    ),
    ContactsModule,
  ],
  providers: [
    {
      provide: BULK_PROCESSORS,
      inject: [ContactBulkActionProcessor],
      useFactory: (
        contact: ContactBulkActionProcessor,
      ) => [contact],
    },
    BulkActionService,
    ContactBulkActionProcessor,
  ],
  controllers: [BulkActionController],
  exports: [
    BULK_PROCESSORS,
    BulkActionService,
    ContactBulkActionProcessor,
  ],
})
export class BulkActionModule {}