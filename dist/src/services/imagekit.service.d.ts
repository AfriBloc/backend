import { ConfigService } from '@nestjs/config';
export declare class ImageKitService {
    private readonly config;
    private readonly client;
    private readonly logger;
    private readonly publicKey;
    private readonly privateKey;
    private readonly urlEndpoint;
    constructor(config: ConfigService);
    upload(fileBuffer: Buffer, fileName: string, folder: string): Promise<{
        url: string;
        fileId: string;
        name: string;
    }>;
}
