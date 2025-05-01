import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { BulkActionService } from 'src/bulk-action/bulk-action.service';

@Processor('bulk-action')
export class BulkActionWorker extends WorkerHost {
  private readonly logger = new Logger(BulkActionWorker.name);

  constructor(private bulkActionService: BulkActionService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`processing job ${job.name} with id ${job.id}`);
    const bulkAction = await this.bulkActionService.findOne(job.data.bulkActionId);
    const result = await this.bulkActionService.process(bulkAction)
    this.logger.log(`completed job ${job.name} with id ${job.id}`);
    return result;
  }
}