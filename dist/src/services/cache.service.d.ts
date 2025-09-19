import Redis from 'ioredis';
export declare class CacheService {
    private readonly client;
    constructor(client: Redis);
    set(key: string, value: any, ttl?: number): Promise<void>;
    get<T>(key: string): Promise<T | null>;
    del(key: string): Promise<void>;
    remember<T>(key: string, ttl: number, cb: () => Promise<T>): Promise<T>;
}
export declare enum TTL {
    FIVE_MINUTES = 300,
    TEN_MINUTES = 600,
    ONE_HOUR = 3600,
    ONE_DAY = 86400,
    THREE_DAYS = 259200,
    ONE_WEEK = 604800,
    ONE_MONTH = 2592000,
    ONE_YEAR = 31536000
}
