import { Module } from '@nestjs/common';
import { ContactsModule } from './contacts/contacts.module';
import { BulkActionModule } from './bulk-action/bulk-action.module';

@Module({
  imports: [BulkActionModule, ContactsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
