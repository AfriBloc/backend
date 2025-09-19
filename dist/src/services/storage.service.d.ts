import { ConfigService } from '@nestjs/config';
import { ImageKitService } from './imagekit.service';
export interface UploadResult {
    url: string;
    fileId: string;
    name: string;
}
export declare class StorageService {
    private readonly imageKit;
    private readonly config;
    constructor(imageKit: ImageKitService, config: ConfigService);
    uploadImage(file: Express.Multer.File, folderKey?: 'imagekit.folderImages' | 'imagekit.folderDocuments'): Promise<UploadResult>;
}
