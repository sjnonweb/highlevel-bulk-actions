import { Expose, Exclude } from 'class-transformer';
import { BulkActionStatus } from 'src/common/enums/bulk-action-status.enum';

@Exclude()
export class BulkActionStatsResponseDto {
  @Expose()
  id: number;

  @Expose()
  status: BulkActionStatus;

  @Expose()
  totalItems: number;

  @Expose()
  processedItems: number;

  @Expose()
  successfulItems: number;

  @Expose()
  failedItems: number;

  @Expose()
  skippedItems: number;
}