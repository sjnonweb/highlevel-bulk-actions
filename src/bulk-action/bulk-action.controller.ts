import { Controller, Get } from '@nestjs/common';
import { BulkAction } from './entities/bulk-action.entity';
import { BulkActionService } from './bulk-action.service';

@Controller('api/v1/bulk-actions')
export class BulkActionController {
  constructor(
    private bulkActionService: BulkActionService,
  ) {}

  @Get()
  async findAll(): Promise<BulkAction[]> {
    return this.bulkActionService.findAll();
  }
}
