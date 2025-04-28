import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BulkActionBatchStatus } from 'src/common/enums/bulk-action-batch-status.enum';
import { BulkAction } from './bulk-action.entity';
import { BulkActionItem } from './bulk-action-items.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity()
export class BulkActionBatch extends BaseEntity {
  @Column({
    type: 'enum',
    enum: BulkActionBatchStatus,
    default: BulkActionBatchStatus.QUEUED
  })
  status: BulkActionBatchStatus

  @Column({ default: 0 })
  totalItems: number;

  @Column({ default: 0 })
  processedItems: number;

  @Column({ default: 0 })
  successfulItems: number;

  @Column({ default: 0 })
  failedItems: number;

  @Column({ default: 0 })
  skippedItems: number;

  @Column({ nullable: true })
  scheduledFor: Date;

  @ManyToOne(() => BulkAction, bulkAction => bulkAction.batches)
  bulkAction: BulkAction;

  @OneToMany(() => BulkActionItem, item => item.batch)
  items: BulkActionItem[];
}
