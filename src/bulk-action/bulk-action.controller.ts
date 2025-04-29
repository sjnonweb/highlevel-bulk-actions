import {
  Controller, Get, Post, Body,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  HttpException,
  HttpStatus,
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

const UPLOAD_DIRECTORY = process.env.UPLOAD_DIRECTORY || '/data/uploads';

@Controller('api/v1/bulk-actions')
export class BulkActionController {
  constructor(
    private bulkActionService: BulkActionService,
  ) {}

  @Get()
  async findAll(): Promise<BulkAction[]> {
    return this.bulkActionService.findAll();
  }

  @Post()
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
    const resp = await this.bulkActionService.save(
      createBulkActionDto,
      file.path,
      parsed.length,
    );
    return resp;
  }
}
