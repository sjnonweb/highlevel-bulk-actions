import { Controller, Get } from '@nestjs/common';

@Controller('api/v1/bulk-action')
export class BulkActionController {
  @Get()
  async findAll(): Promise<string> {
    return "Hello!!"
  }
}