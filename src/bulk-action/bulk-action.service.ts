import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BulkAction } from './entities/bulk-action.entity';
import * as fs from 'fs';
import { parse } from 'fast-csv';
import { BulkActionCreateDto } from './dto/bulk-action-create.dto';
import { BulkActionResponseDto } from './dto/bulk-action-response.dto';
import { plainToInstance } from 'class-transformer';
import { Queue, JobType } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { IBulkActionProcessor } from './processors/abstract.processor';
import { BulkActionItem } from './entities/bulk-action-items.entity';

@Injectable()
export class BulkActionService {
  constructor(
    @Inject('BULK_PROCESSORS')
    private processors: IBulkActionProcessor[],
    @InjectRepository(BulkAction)
    private bulkActionRepository: Repository<BulkAction>,
    @InjectRepository(BulkActionItem)
    private bulkActionItemRepository: Repository<BulkActionItem>,
    @InjectQueue('bulk-action')
    private bulkActionQueue: Queue,
  ) {}

  async process(bulkAction: BulkAction): Promise<boolean> {
    const processor = this.processors.find((p) => p.supports(bulkAction.entityType))
    if (!processor) {
      throw new Error(`Proessor not found for entityType: ${bulkAction.entityType}`)
    }
    return await processor.process(bulkAction);
  }

  async findOne(id: number): Promise<BulkAction> {
    return this.bulkActionRepository.findOneByOrFail({ id });
  }

  async findAll(): Promise<BulkAction[]> {
    return this.bulkActionRepository.find();
  }

  async create(
    bulkActionData: BulkActionCreateDto,
    file: string,
    totalItems: number,
  ): Promise<BulkActionResponseDto> {
    const bulkAction = this.bulkActionRepository.create({
      ...bulkActionData,
      file,
      totalItems,
    });
    await this.bulkActionRepository.save(bulkAction);
    await this.bulkActionQueue.add('bulk-action', {
      bulkActionId: bulkAction.id,
    });
    return plainToInstance(BulkActionResponseDto, bulkAction);
  }

  async getAllJobs(): Promise<any> {
    const status: JobType[] = ['waiting', 'active', 'completed', 'failed', 'delayed'];
    return await this.bulkActionQueue.getJobs(status);
  }

  async parseCsvFile(path: string): Promise<Record<string, string>[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      fs.createReadStream(path)
        .pipe(parse({ headers: true }))
        .on('error', (error) => reject(error))
        .on('data', (row) => results.push(row))
        .on('end', () => resolve(results));
    });
  }

  async createBulkActionItem(payload: Partial<BulkActionItem>): Promise<BulkActionItem> {
    const bulkActionItem = this.bulkActionItemRepository.create(payload);
    return await this.bulkActionItemRepository.save(bulkActionItem);
  }
}