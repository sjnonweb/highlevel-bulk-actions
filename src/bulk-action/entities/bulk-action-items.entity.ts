import {
  Entity,
  Column,
  ManyToOne,
} from 'typeorm';
import { BulkActionItemStatus } from 'src/common/enums/bulk-action-item-status.enum';
import { BulkAction } from './bulk-action.entity';
// import { BulkActionBatch } from './bulk-action-batch.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity()
export class BulkActionItem extends BaseEntity {
  @Column({
    type: 'enum',
    enum: BulkActionItemStatus,
    default: BulkActionItemStatus.QUEUED,
  })
  status: BulkActionItemStatus

  @Column()
  entityId: string;

  @ManyToOne(() => BulkAction, bulkAction => bulkAction.items)
  bulkAction: BulkAction;

  @Column({ type: 'text', nullable: true })
  message?: string;

  // @ManyToOne(() => BulkActionBatch, batch => batch.items)
  // batch: BulkActionBatch;
}
