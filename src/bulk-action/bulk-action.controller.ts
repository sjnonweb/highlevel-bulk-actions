import {
  Controller, Get, Post, Body,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  HttpException,
  HttpStatus,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { BulkAction } from './entities/bulk-action.entity';
import { BulkActionService } from './bulk-action.service';
import { BulkActionCreateDto } from './dto/bulk-action-create.dto';
import { BulkActionResponseDto } from './dto/bulk-action-response.dto';
import { BulkActionStatsResponseDto } from './dto/bulk-action-stats-response.dto';
import { plainToInstance } from 'class-transformer';
import { BulkActionFilterDto } from './dto/bulk-action-filter.dto';
import { ApiOperation } from '@nestjs/swagger';

const UPLOAD_DIRECTORY = process.env.UPLOAD_DIRECTORY || '/data/uploads';

@Controller('api/v1/bulk-actions')
export class BulkActionController {
  constructor(
    private bulkActionService: BulkActionService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all bulk actions. Filter is supported',
  })
  async findAll(
    @Query() query: BulkActionFilterDto,
  ): Promise<BulkAction[]> {
    return this.bulkActionService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get bulk action details',
  })
  async findOne(@Param('id') id: number): Promise<BulkAction> {
    const bulkAction =  await this.bulkActionService.findOne(id);
    if (!bulkAction) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND)
    }
    return bulkAction;
  }

  @Get(':id/stats')
  @ApiOperation({
    summary: 'Get bulk action stats',
  })
  async findStats(@Param('id') id: number): Promise<BulkActionStatsResponseDto> {
    const bulkAction =  await this.bulkActionService.findOne(id);
    if (!bulkAction) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND)
    }
    return plainToInstance(BulkActionStatsResponseDto, bulkAction);
  }

  @Get(':id/logs')
  @ApiOperation({
    summary: 'Get bulk action logs',
  })
  async findLogs(@Param('id') id: number): Promise<BulkAction> {
    const bulkAction =  await this.bulkActionService.findBulkActionItems(id);
    if (!bulkAction) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND)
    }
    return bulkAction;
  }

  @Post()
  @ApiOperation({
    summary: 'Create bulk action',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          if (!fs.existsSync(UPLOAD_DIRECTORY)) {
            return cb(
              new HttpException(
                `Upload directory does not exist`,
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
              '',
            );
          }
          cb(null, UPLOAD_DIRECTORY);
        },
        filename: (req, file, cb) => {
          const fileSuffix =  Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname)
          const base = path.basename(file.originalname, ext)
          const filename = `${base}-${fileSuffix}${ext}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv') {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only CSV files are allowed'), false);
        }
      },
    }),
  )
  async create(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body() createBulkActionDto: BulkActionCreateDto,
  ): Promise<BulkActionResponseDto> {
    const parsed = await this.bulkActionService.parseCsvFile(file.path)
    const resp = await this.bulkActionService.create(
      createBulkActionDto,
      file.path,
      parsed.length,
    );
    return resp;
  }
}
