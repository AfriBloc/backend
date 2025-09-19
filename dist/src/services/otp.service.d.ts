import { CacheService } from './cache.service';
export declare class OtpService {
    private cache;
    constructor(cache: CacheService);
    generateFor(identifier: string): Promise<string>;
    verify(code: string, identifier: string): Promise<boolean>;
    invalidate(code: string, identifier: string): Promise<void>;
    getOtpByUserIdentifier(identifier: string): Promise<string | null>;
}
