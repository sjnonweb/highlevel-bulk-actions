import { Module } from '@nestjs/common';
import { BulkActionController } from './bulk-action.controller';
import { BulkActionService } from './bulk-action.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BulkAction } from './entities/bulk-action.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BulkAction])],
  providers: [BulkActionService],
  controllers: [BulkActionController],
})
export class BulkActionModule {}