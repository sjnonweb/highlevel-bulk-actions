import { Module } from '@nestjs/common';
import { BulkActionController } from './bulk-action.controller';

@Module({
  imports: [],
  controllers: [BulkActionController],
  providers: [],
})
export class BulkActionModule {}