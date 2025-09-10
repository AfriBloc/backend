/* eslint-disable @typescript-eslint/no-require-imports */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ImageKit = require('imagekit');

@Injectable()
export class ImageKitService {
  private readonly client: ImageKit;
  private readonly logger = new Logger(ImageKitService.name);
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly urlEndpoint: string;

  constructor(private readonly config: ConfigService) {
    this.publicKey = this.config.get<string>('imagekit.publicKey') || '';
    this.privateKey = this.config.get<string>('imagekit.privateKey') || '';
    this.urlEndpoint = this.config.get<string>('imagekit.urlEndpoint') || '';

    if (!this.publicKey || !this.privateKey || !this.urlEndpoint) {
      this.logger.warn(
        'ImageKit configuration is incomplete. Please check publicKey, privateKey, and urlEndpoint.',
      );
    }
    this.client = new ImageKit({
      publicKey: this.publicKey,
      privateKey: this.privateKey,
      urlEndpoint: this.urlEndpoint,
    });
  }

  async upload(
    fileBuffer: Buffer,
    fileName: string,
    folder: string,
  ): Promise<{ url: string; fileId: string; name: string }> {
    const res = await this.client.upload({
      file: fileBuffer,
      fileName,
      folder,
      useUniqueFileName: true,
      overwriteFile: false,
    });
    return { url: res.url, fileId: res.fileId, name: res.name };
  }
}
