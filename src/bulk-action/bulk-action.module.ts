import { Module } from '@nestjs/common';
import { BulkActionController } from './bulk-action.controller';
import { BulkActionService } from './bulk-action.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BulkAction } from './entities/bulk-action.entity';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forFeature([BulkAction]),
    BullModule.registerQueue(
      { name: 'bulk-action' },
      { name: 'bulk-action-batch' },
    ),
  ],
  providers: [BulkActionService],
  controllers: [BulkActionController],
})
export class BulkActionModule {}