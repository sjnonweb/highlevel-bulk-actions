import { BulkActionEntityType } from 'src/common/enums/bulk-action-entity-type.enum';
import { BulkActionStatus } from 'src/common/enums/bulk-action-status.enum';
import { Expose, Exclude } from 'class-transformer';

@Exclude()
export class BulkActionResponseDto {
  @Expose()
  id: number;

  @Expose()
  accountId: string;

  @Expose()
  entityType: BulkActionEntityType;

  @Expose()
  scheduledFor?: Date;

  @Expose()
  status: BulkActionStatus;

  @Expose()
  totalItems: number;
}