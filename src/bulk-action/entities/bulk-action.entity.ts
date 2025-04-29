import {
  Entity,
  Column,
  OneToMany,
} from 'typeorm';
import { BulkActionStatus } from 'src/common/enums/bulk-action-status.enum';
import { BulkActionBatch } from './bulk-action-batch.entity';
import { BulkActionItem } from './bulk-action-items.entity';
import { BulkActionEntityType } from 'src/common/enums/bulk-action-entity-type.enum';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity()
export class BulkAction extends BaseEntity {
  @Column()
  accountId: string;

  @Column({ nullable: true })
  scheduledFor?: Date;

  @Column({
    type: 'enum',
    enum: BulkActionEntityType,
  })
  entityType: BulkActionEntityType;

  @Column()
  file: string;

  @Column({
    type: 'enum',
    enum: BulkActionStatus,
    default: BulkActionStatus.QUEUED
  })
  status: BulkActionStatus;

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

  @OneToMany(() => BulkActionBatch, batch => batch.bulkAction)
  batches: BulkActionBatch[];

  @OneToMany(() => BulkActionItem, item => item.batch)
  items: BulkActionItem[];
}
