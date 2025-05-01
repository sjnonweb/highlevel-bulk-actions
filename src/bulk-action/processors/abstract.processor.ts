import { BulkAction } from "../entities/bulk-action.entity";
import { BulkActionEntityType } from "src/common/enums/bulk-action-entity-type.enum";

export interface IBulkActionProcessor {
  supports(entityType: BulkActionEntityType): boolean;
  process(bulkAction: BulkAction): Promise<boolean>;
}

export abstract class AbstractBulkActionProcessor implements IBulkActionProcessor {
  abstract readonly entityType: BulkActionEntityType;

  supports(entityType: BulkActionEntityType): boolean {
    return this.entityType === entityType;
  }

  abstract process(bulkAction: BulkAction): Promise<boolean>;
}