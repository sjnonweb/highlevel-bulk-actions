import { BulkAction } from "../entities/bulk-action.entity";
import { BulkActionEntityType } from "src/common/enums/bulk-action-entity-type.enum";

export interface IBulkActionProcessor<T=any> {
  entityType: T;
  supports(entityType: T): boolean;
  process(bulkAction: BulkAction): Promise<boolean>;
}

export abstract class BulkActionProcessor<T> implements IBulkActionProcessor<T> {
  abstract readonly entityType: T;

  supports(entityType: T): boolean {
    return this.entityType === entityType;
  }

  abstract process(bulkAction: BulkAction): Promise<boolean>;
}