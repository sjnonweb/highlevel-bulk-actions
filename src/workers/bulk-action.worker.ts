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
    this.logger.log(`Processing job ${job.name} with id ${job.id}`);
    try {
      const bulkActionId = job.data.bulkActionId;
      const bulkAction = await this.bulkActionService.findOne(bulkActionId);
      if (!bulkAction) {
        throw new Error(`Bulk action with id ${bulkActionId} does not exist`);
      }
      await this.bulkActionService.process(bulkAction)
    } catch (error) {
      this.logger.error('An error occured while processing the job');
      this.logger.error(error);
    }
    this.logger.log(`Completed job ${job.name} with id ${job.id}`);
    return true;
  }
}