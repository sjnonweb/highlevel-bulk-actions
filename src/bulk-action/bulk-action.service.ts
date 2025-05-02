import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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
    private dataSource: DataSource,
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

  async findOne(id: number): Promise<BulkAction | null> {
    return this.bulkActionRepository.findOneBy({ id });
  }

  async findAll(): Promise<BulkAction[]> {
    return this.bulkActionRepository.find({
      order: {
        createdAt: 'DESC',
      }
    });
  }

  async findBulkActionItems(id: number): Promise<BulkAction | null> {
    return this.bulkActionRepository.findOne({
      where: { id },
      relations: ['items']
    });
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
    const jobOptions: any = {};
    if (bulkActionData.scheduledFor) {
      jobOptions.delay = bulkActionData.scheduledFor.getTime() - Date.now();
    }
    await this.bulkActionQueue.add(
      'bulk-action',
      {
        bulkActionId: bulkAction.id,
      },
      jobOptions,
    );
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

  async incrementBulkActionStats(
    bulkAction: BulkAction,
    counters: {
      successfulItems: number,
      failedItems: number,
      skippedItems: number,
    },
  ): Promise<any> {
    const processedItems = counters.successfulItems + counters.failedItems + counters.skippedItems;
    const query = this.dataSource.createQueryBuilder()
      .update(BulkAction)
      .set({
        processedItems: () => "processedItems + :processedItems",
        successfulItems: () => "successfulItems + :successfulItems",
        failedItems: () => "failedItems + :failedItems",
        skippedItems: () => "skippedItems + :skippedItems",
      })
      .where("id = :id", { id: bulkAction.id })
      .setParameters({
        processedItems,
        successfulItems: counters.successfulItems,
        failedItems: counters.failedItems,
        skippedItems: counters.skippedItems,
      });
    return await query.execute();
  }
}
