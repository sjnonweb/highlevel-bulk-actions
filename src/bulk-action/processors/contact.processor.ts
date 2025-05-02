import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { BulkAction } from '../entities/bulk-action.entity';
import { BulkActionProcessor } from './abstract.processor';
import { BulkActionEntityType } from 'src/common/enums/bulk-action-entity-type.enum';
import { ContactsService } from 'src/contacts/contacts.service';
import { BulkActionService } from '../bulk-action.service';
import { Logger } from '@nestjs/common';
import { BulkActionItemStatus } from 'src/common/enums/bulk-action-item-status.enum';
import { QueryFailedError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BulkActionItem } from '../entities/bulk-action-items.entity';
import { Contact } from 'src/contacts/entities/contact.entity';

@Injectable()
export class ContactBulkActionProcessor extends BulkActionProcessor<BulkActionEntityType.CONTACT> {
  readonly entityType = BulkActionEntityType.CONTACT;
  private readonly logger: Logger = new Logger(ContactBulkActionProcessor.name);

  constructor(
    @Inject(forwardRef(() => BulkActionService))
    private bulkActionService: BulkActionService,
    @InjectRepository(BulkActionItem)
    private bulkActionItemRepository: Repository<BulkActionItem>,
    private contactsService: ContactsService,
  ) {
    super();
  }

  async process(bulkAction: BulkAction): Promise<boolean> {
    const parsed = await this.bulkActionService.parseCsvFile(bulkAction.file);
    let counters: any = {};
    try {
      // trying bulk insert first
      this.logger.log('Processing in bulk mode');
      counters = await this.processBulk(bulkAction, parsed);
    } catch (error) {
      this.logger.error('An error occurred while processing the job');
      this.logger.error(error);

      // failure in bulk save, fallback to sequential processing
      this.logger.log('Falling back to sequential mode');
      counters = await this.processSqeuential(bulkAction, parsed);
    }

    // TODO: use atomic updates for counters
    // await this.bulkActionService.incrementBulkActionStats(bulkAction, counters);
    // tried atomic update for these fields to prevent race condition
    // but there is a error with the query, not enough time to figure it
    // out right now
    bulkAction.processedItems += (counters.successfulItems + counters.failedItems + counters.skippedItems);
    bulkAction.successfulItems += counters.successfulItems;
    bulkAction.failedItems += counters.failedItems;
    bulkAction.skippedItems += counters.skippedItems;
    await bulkAction.save();

    return true;
  }

  async processSqeuential(
    bulkAction: BulkAction,
    parsed: Record<string, string>[],
  ): Promise<Record<string, number>> {
    const counters = {
      successfulItems: 0,
      failedItems: 0,
      skippedItems: 0,
    };
    for (const row of parsed) {
      let bulkActionItem = await this.bulkActionItemRepository.findOneBy({
        bulkAction: {
          id: bulkAction.id,
        },
        entityId: row['email'],
      });
      if (!bulkActionItem) {
        bulkActionItem = this.bulkActionItemRepository.create({
          bulkAction,
          entityId: row['email'],
          status: BulkActionItemStatus.QUEUED,
        });
      }
      try {
        const contact = this.contactsService.create({
          accountId: bulkAction.accountId,
          email: row['email'],
          name: row['name'],
          age: parseInt(row['age']),
        });
        await contact.save();

        bulkActionItem.status = BulkActionItemStatus.SUCCESS;
        await bulkActionItem.save();
        counters.successfulItems += 1;
      } catch (error) {
        bulkActionItem.message = error.detail || 'Internal Server Error';
        if (error instanceof QueryFailedError) {
          const err: any = error;
          if (err.code === '23505') {
            // duplicate constraint failure
            bulkActionItem.status = BulkActionItemStatus.SKIPPED;
            counters.skippedItems += 1;
          } else {
            // failed for any other reason
            bulkActionItem.status = BulkActionItemStatus.FAILED;
            counters.failedItems += 1;
          }
        } else {
          bulkActionItem.status = BulkActionItemStatus.FAILED;
          counters.failedItems += 1;
        }
      } finally {
        await bulkActionItem.save();
      }
    }
    return counters;
  }

  async processBulk(
    bulkAction: BulkAction,
    parsed: Record<string, string>[],
  ): Promise<Record<string, number>> {
    const bulkActionItems: BulkActionItem[] = [];
    parsed.forEach((row) => {
      bulkActionItems.push(
        this.bulkActionItemRepository.create({
          status: BulkActionItemStatus.QUEUED,
          entityId: row['email'],
          bulkAction,
        }),
      );
    });
    await this.bulkActionItemRepository.save(bulkActionItems);

    const contacts: Contact[] = [];
    parsed.forEach((row) => {
      contacts.push(
        this.contactsService.create({
          accountId: bulkAction.accountId,
          email: row['email'],
          name: row['name'],
          age: parseInt(row['age']),
        }),
      );
    });
    await this.contactsService.saveBulk(contacts);

    bulkActionItems.forEach((item) => {
      item.status = BulkActionItemStatus.SUCCESS;
    });

    await this.bulkActionItemRepository.save(bulkActionItems);

    return {
      successfulItems: parsed.length,
      failedItems: 0,
      skippedItems: 0,
    };
  }
}
