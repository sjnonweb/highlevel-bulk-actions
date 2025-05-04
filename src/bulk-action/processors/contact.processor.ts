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
import { ProcessorCounter } from './processor-counter.type';

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
    try {
      // trying bulk insert first
      this.logger.log('Processing in bulk mode');
      await this.processBulk(bulkAction, parsed);
    } catch (error) {
      this.logger.error('An error occurred while processing the job');
      this.logger.error(error);

      // failure in bulk save, fallback to sequential processing
      this.logger.log('Falling back to sequential mode');
      await this.processSqeuential(bulkAction, parsed);
    }
    return true;
  }

  async processSqeuential(
    bulkAction: BulkAction,
    parsed: Record<string, string>[],
  ): Promise<void> {
    for (const row of parsed) {
      const counter: ProcessorCounter = {
        successfulItems: 0,
        failedItems: 0,
        skippedItems: 0,
      };
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
        counter.successfulItems += 1;
      } catch (error) {
        bulkActionItem.message = error.detail || 'Internal Server Error';
        if (error instanceof QueryFailedError) {
          const err: any = error;
          if (err.code === '23505') {
            // duplicate constraint failure
            bulkActionItem.status = BulkActionItemStatus.SKIPPED;
            counter.skippedItems += 1;
          } else {
            // failed for any other reason
            bulkActionItem.status = BulkActionItemStatus.FAILED;
            counter.failedItems += 1;
          }
        } else {
          bulkActionItem.status = BulkActionItemStatus.FAILED;
          counter.failedItems += 1;
        }
      } finally {
        // TODO: use atomic updates for counter
        // await this.bulkActionService.incrementBulkActionStatsAtomic(bulkAction, counter);
        // tried atomic update for these fields to prevent race condition
        // but there is a error with the query, not enough time to figure it
        // out right now
        await this.bulkActionService.incrementBulkActionStats(bulkAction, counter);
        await bulkActionItem.save();
      }
    }
  }

  async processBulk(
    bulkAction: BulkAction,
    parsed: Record<string, string>[],
  ): Promise<void> {
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

    // TODO: use atomic updates for counter
    // await this.bulkActionService.incrementBulkActionStatsAtomic(bulkAction, counter);
    // tried atomic update for these fields to prevent race condition
    // but there is a error with the query, not enough time to figure it
    // out right now
    await this.bulkActionService.incrementBulkActionStats(bulkAction, {
      successfulItems: parsed.length,
      failedItems: 0,
      skippedItems: 0,
    });
  }
}
