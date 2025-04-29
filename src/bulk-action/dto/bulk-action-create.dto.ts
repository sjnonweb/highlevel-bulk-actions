import { IsString, IsOptional, IsEnum, IsDate } from 'class-validator';
import { BulkActionEntityType } from 'src/common/enums/bulk-action-entity-type.enum';

export class BulkActionCreateDto {
  @IsString()
  accountId: string;

  @IsEnum(BulkActionEntityType)
  entityType: BulkActionEntityType;

  @IsDate()
  @IsOptional()
  scheduledFor?: Date;
}