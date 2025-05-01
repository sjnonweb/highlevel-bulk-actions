import { Injectable } from '@nestjs/common';
import { BulkAction } from '../entities/bulk-action.entity';
import { BulkActionProcessor } from './abstract.processor';
import { BulkActionEntityType } from 'src/common/enums/bulk-action-entity-type.enum';
import { ContactsService } from 'src/contacts/contacts.service';

@Injectable()
export class ContactBulkActionProcessor extends BulkActionProcessor<BulkActionEntityType.CONTACT> {
  readonly entityType = BulkActionEntityType.CONTACT;

  constructor(private contactsService: ContactsService) {
    super();
  }

  async process(bulkAction: BulkAction): Promise<boolean> {
    return true;
  }
}