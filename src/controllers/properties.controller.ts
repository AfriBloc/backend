import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PropertiesService } from '../services/properties.service';
import { ConfigService } from '@nestjs/config';
import { ImageKitService } from '../services/imagekit.service';
import { StorageService } from '../services/storage.service';
import {
  CreatePropertyDto,
  SeedPropertiesDto,
} from '../dto/create-property.dto';
import { Property } from '../entities/property.entity';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PurchasePropertyDto } from 'src/dto/purchase-property.dto';

function hasUrl(obj: unknown): obj is { url: string } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'url' in obj &&
    typeof (obj as { url?: unknown }).url === 'string'
  );
}

@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly imageKit: ImageKitService,
    private readonly storage: StorageService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async list() {
    return { data: await this.propertiesService.list() };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async get(@Param('id') id: string) {
    return { data: await this.propertiesService.getById(id) };
  }

  // One endpoint: creates property, units, uploads images and documents atomically
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'deedOfAssignment', maxCount: 1 },
      { name: 'governorsConsent', maxCount: 1 },
      { name: 'surveyPlan', maxCount: 1 },
      { name: 'images', maxCount: 20 },
    ]),
  )
  async createProperty(
    @Body() createPropertyDto: CreatePropertyDto,
    @UploadedFiles()
    files: {
      deedOfAssignment?: Express.Multer.File[];
      governorsConsent?: Express.Multer.File[];
      surveyPlan?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    // Handle images
    const imageUrls: string[] = [];
    if (Array.isArray(files.images)) {
      for (const file of files.images) {
        if (
          file &&
          typeof file === 'object' &&
          Buffer.isBuffer(file.buffer) &&
          typeof file.originalname === 'string' &&
          typeof file.mimetype === 'string'
        ) {
          let upload: unknown;
          try {
            upload = await this.storage.uploadImage(
              file,
              'imagekit.folderImages',
            );
          } catch {
            throw new BadRequestException('Image upload failed.');
          }
          if (!hasUrl(upload)) {
            throw new BadRequestException('Image upload failed.');
          }
          const { url } = upload;
          imageUrls.push(url);
        }
      }
    }

    // Handle documents
    const docUrls: {
      governorsConsentUrl?: string;
      deedOfAssignmentUrl?: string;
      surveyPlanUrl?: string;
    } = {};

    if (Array.isArray(files.governorsConsent) && files.governorsConsent[0]) {
      const file = files.governorsConsent[0];
      if (
        file &&
        typeof file === 'object' &&
        Buffer.isBuffer(file.buffer) &&
        typeof file.originalname === 'string' &&
        typeof file.mimetype === 'string'
      ) {
        let upload: unknown;
        try {
          upload = await this.storage.uploadImage(
            file,
            'imagekit.folderDocuments',
          );
        } catch {
          throw new BadRequestException(
            'Governors Consent document upload failed.',
          );
        }
        if (!hasUrl(upload)) {
          throw new BadRequestException(
            'Governors Consent document upload failed.',
          );
        }
        docUrls.governorsConsentUrl = upload.url;
      }
    }
    if (Array.isArray(files.deedOfAssignment) && files.deedOfAssignment[0]) {
      const file = files.deedOfAssignment[0];
      if (
        file &&
        typeof file === 'object' &&
        Buffer.isBuffer(file.buffer) &&
        typeof file.originalname === 'string' &&
        typeof file.mimetype === 'string'
      ) {
        let upload: unknown;
        try {
          upload = await this.storage.uploadImage(
            file,
            'imagekit.folderDocuments',
          );
        } catch {
          throw new BadRequestException(
            'Deed of Assignment document upload failed.',
          );
        }
        if (!hasUrl(upload)) {
          throw new BadRequestException(
            'Deed of Assignment document upload failed.',
          );
        }
        docUrls.deedOfAssignmentUrl = upload.url;
      }
    }
    if (Array.isArray(files.surveyPlan) && files.surveyPlan[0]) {
      const file = files.surveyPlan[0];
      if (
        file &&
        typeof file === 'object' &&
        Buffer.isBuffer(file.buffer) &&
        typeof file.originalname === 'string' &&
        typeof file.mimetype === 'string'
      ) {
        let upload: unknown;
        try {
          upload = await this.storage.uploadImage(
            file,
            'imagekit.folderDocuments',
          );
        } catch {
          throw new BadRequestException('Survey Plan document upload failed.');
        }
        if (!hasUrl(upload)) {
          throw new BadRequestException('Survey Plan document upload failed.');
        }
        docUrls.surveyPlanUrl = upload.url;
      }
    }

    // Create property and subProperties inside transaction
    const property = await this.propertiesService.createFull({
      ...createPropertyDto,
      imageUrls,
      governorsConsentUrl: docUrls.governorsConsentUrl ?? null,
      deedOfAssignmentUrl: docUrls.deedOfAssignmentUrl ?? null,
      surveyPlanUrl: docUrls.surveyPlanUrl ?? null,
    });

    return property;
  }

  /**
   * Seed multiple properties directly with all data, including file/document URLs.
   * This endpoint is for seeding initial data and does not handle file uploads.
   *
   * Example body:
   * {
   *   "properties": [ { ...property1 }, { ...property2 } ]
   * }
   */
  @Post('seed')
  async seedProperty(@Body() body: SeedPropertiesDto) {
    const results: Property[] = [];
    for (const property of body.properties) {
      const { ...propertyDtoRaw } = property;
      const propertyDto = propertyDtoRaw as Partial<CreatePropertyDto>;

      const created = await this.propertiesService.createFull(propertyDto);
      results.push(created);
    }
    return results;
  }

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  async purchasePropertyUnits(
    @Body() dto: PurchasePropertyDto,
    @Request() req,
  ) {
    const userId = req.user.id;

    const result = await this.propertiesService.purchasePropertyUnits(
      userId,
      dto.propertyId,
      dto.units,
    );
    return result;
  }
}
