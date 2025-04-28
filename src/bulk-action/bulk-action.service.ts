import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BulkAction } from './entities/bulk-action.entity';

@Injectable()
export class BulkActionService {
  constructor(
    @InjectRepository(BulkAction)
    private bulkActionRepository: Repository<BulkAction>,
  ) {}

  findAll(): Promise<BulkAction[]> {
    return this.bulkActionRepository.find();
  }
}