import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { BulkActionService } from 'src/bulk-action/bulk-action.service';
import { BulkActionStatus } from 'src/common/enums/bulk-action-status.enum';
import { BulkAction } from 'src/bulk-action/entities/bulk-action.entity';

@Processor('bulk-action')
export class BulkActionWorker extends WorkerHost {
  private readonly logger = new Logger(BulkActionWorker.name);

  constructor(private bulkActionService: BulkActionService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.name} with id ${job.id}`);
    let bulkAction: BulkAction | undefined;
    try {
      const bulkActionId = job.data.bulkActionId;
      bulkAction = await this.bulkActionService.findOne(bulkActionId);
      if (!bulkAction) {
        throw new Error(`Bulk action with id ${bulkActionId} does not exist`);
      }
      bulkAction.status = BulkActionStatus.IN_PROGRESS;
      await bulkAction.save();
      await this.bulkActionService.process(bulkAction)
      bulkAction.status = BulkActionStatus.SUCCESS;
      await bulkAction.save();
    } catch (error) {
      this.logger.error('An error occured while processing the job');
      this.logger.error(error);
      if (bulkAction) {
        bulkAction.status = BulkActionStatus.FAILED;
        await bulkAction.save();
      }
    }
    this.logger.log(`Completed job ${job.name} with id ${job.id}`);
    return true;
  }
}