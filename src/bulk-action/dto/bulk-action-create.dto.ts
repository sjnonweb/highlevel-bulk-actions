import { IsString, IsOptional, IsEnum, IsDate } from 'class-validator';
import { BulkActionEntityType } from 'src/common/enums/bulk-action-entity-type.enum';
import { Type } from 'class-transformer';

export class BulkActionCreateDto {
  @IsString()
  accountId: string;

  @IsEnum(BulkActionEntityType)
  entityType: BulkActionEntityType;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  scheduledFor?: Date;
}