import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ContactsModule } from './contacts/contacts.module';
import { BulkActionModule } from './bulk-action/bulk-action.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BulkActionModule,
    ContactsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
