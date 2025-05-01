import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { BulkAction } from '../entities/bulk-action.entity';
import { BulkActionProcessor } from './abstract.processor';
import { BulkActionEntityType } from 'src/common/enums/bulk-action-entity-type.enum';
import { ContactsService } from 'src/contacts/contacts.service';
import { BulkActionService } from '../bulk-action.service';
import { Logger } from '@nestjs/common';
import { BulkActionItemStatus } from 'src/common/enums/bulk-action-item-status.enum';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class ContactBulkActionProcessor extends BulkActionProcessor<BulkActionEntityType.CONTACT> {
  readonly entityType = BulkActionEntityType.CONTACT;
  private readonly logger: Logger = new Logger(ContactBulkActionProcessor.name);

  constructor(
    @Inject(forwardRef(() => BulkActionService))
    private bulkActionService: BulkActionService,
    private contactsService: ContactsService,
  ) {
    super();
  }

  async process(bulkAction: BulkAction): Promise<boolean> {
    const parsed = await this.bulkActionService.parseCsvFile(bulkAction.file);
    for (const row of parsed) {
      const bulkActionItem = await this.bulkActionService.createBulkActionItem({
        status: BulkActionItemStatus.QUEUED,
        entityId: row["email"],
        bulkAction,
      });
      try {
        await this.contactsService.create({
          accountId: bulkAction.accountId,
          email: row["email"],
          name: row["name"],
          age: parseInt(row["age"]),
        });
        bulkActionItem.status = BulkActionItemStatus.SUCCESS;
      } catch (error) {
        this.logger.error('An error occurred while processing the job');
        this.logger.error(error);
        bulkActionItem.message = error.detail || 'Internal Server Error';
        if (error instanceof QueryFailedError) {
          const err: any = error;
          if (err.code === '23505') {
            // duplicate constraint failure
            bulkActionItem.status = BulkActionItemStatus.SKIPPED;
          } else {
            // failed for any other reason
            bulkActionItem.status = BulkActionItemStatus.FAILED;
          }
        } else {
          bulkActionItem.status = BulkActionItemStatus.FAILED;
        }
      } finally {
        await bulkActionItem.save();
      }
    }
    return true;
  }
}
