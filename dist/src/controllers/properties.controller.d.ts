import { PropertiesService } from '../services/properties.service';
import { ConfigService } from '@nestjs/config';
import { ImageKitService } from '../services/imagekit.service';
import { StorageService } from '../services/storage.service';
import { CreatePropertyDto, SeedPropertiesDto } from '../dto/create-property.dto';
import { Property } from '../entities/property.entity';
import { PurchasePropertyDto } from 'src/dto/purchase-property.dto';
export declare class PropertiesController {
    private readonly propertiesService;
    private readonly imageKit;
    private readonly storage;
    private readonly config;
    constructor(propertiesService: PropertiesService, imageKit: ImageKitService, storage: StorageService, config: ConfigService);
    list(): Promise<{
        data: Property[];
    }>;
    get(id: string): Promise<{
        data: Property;
    }>;
    createProperty(createPropertyDto: CreatePropertyDto, files: {
        deedOfAssignment?: Express.Multer.File[];
        governorsConsent?: Express.Multer.File[];
        surveyPlan?: Express.Multer.File[];
        images?: Express.Multer.File[];
    }): Promise<Property>;
    seedProperty(body: SeedPropertiesDto): Promise<Property[]>;
    purchasePropertyUnits(dto: PurchasePropertyDto, req: any): Promise<{
        message: string;
        transaction: import("../entities/transaction.entity").Transaction;
    }>;
}
