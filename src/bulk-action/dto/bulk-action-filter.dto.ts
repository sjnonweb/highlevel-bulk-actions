import { IsString, IsOptional, IsEnum } from 'class-validator';
import { BulkActionStatus } from 'src/common/enums/bulk-action-status.enum';

export class BulkActionFilterDto {
  @IsString()
  @IsOptional()
  accountId: string;

  @IsEnum(BulkActionStatus)
  @IsOptional()
  status: BulkActionStatus;
}