import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BulkAction } from './entities/bulk-action.entity';
import * as fs from 'fs';
import neatCsv from 'neat-csv';
import { BulkActionCreateDto } from './dto/bulk-action-create.dto';
import { BulkActionResponseDto } from './dto/bulk-action-response.dto';
import { plainToInstance } from 'class-transformer';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class BulkActionService {
  constructor(
    @InjectRepository(BulkAction)
    private bulkActionRepository: Repository<BulkAction>,
    @InjectQueue('bulk-action')
    private bulkActionQueue: Queue,
  ) {}

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

  async parseCsvFile(path: string): Promise<Record<string, string>[]> {
    let fileStream = fs.createReadStream(path);
    try {
      const parsed = await neatCsv(fileStream);
      return parsed;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      if (fileStream) {
        fileStream.close();
      }
    }
  }
}