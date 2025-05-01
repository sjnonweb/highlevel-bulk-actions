import { Module } from '@nestjs/common';
import { BulkActionController } from './bulk-action.controller';
import { BulkActionService } from './bulk-action.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BulkAction } from './entities/bulk-action.entity';
import { BullModule } from '@nestjs/bullmq';
import { ContactBulkActionProcessor } from './processors/contact.processor';
import { ContactsService } from 'src/contacts/contacts.service';
import { Contact } from 'src/contacts/entities/contact.entity';

export const BULK_PROCESSORS = 'BULK_PROCESSORS';

@Module({
  imports: [
    TypeOrmModule.forFeature([BulkAction, Contact]),
    BullModule.registerQueue(
      { name: 'bulk-action' },
    ),
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
    ContactsService,
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