import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ImageKitService } from './imagekit.service';
// import { extname } from 'path';

export interface UploadResult {
  url: string;
  fileId: string;
  name: string;
}

@Injectable()
export class StorageService {
  constructor(
    private readonly imageKit: ImageKitService,
    private readonly config: ConfigService,
  ) {}

  async uploadImage(
    file: Express.Multer.File,
    folderKey:
      | 'imagekit.folderImages'
      | 'imagekit.folderDocuments' = 'imagekit.folderImages',
  ): Promise<UploadResult> {
    // const fileExt = extname(file.originalname);
    const folder =
      this.config.get<string>(folderKey) ||
      (folderKey === 'imagekit.folderImages'
        ? '/properties/images'
        : '/properties/documents');
    const fileName = `${Date.now()}-${file.originalname}`;
    return this.imageKit.upload(file.buffer, fileName, folder);
  }
}
