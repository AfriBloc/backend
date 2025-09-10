import { Injectable } from '@nestjs/common';
import { CacheService, TTL } from './cache.service';
@Injectable()
export class OtpService {
  constructor(private cache: CacheService) {}
  async generateFor(identifier: string): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.cache.set(`otp:${code}`, identifier, TTL.FIVE_MINUTES);
    await this.cache.set(`user_otp:${identifier}`, code, TTL.FIVE_MINUTES);
    return code;
  }

  async verify(code: string, identifier: string): Promise<boolean> {
    const cachedUser = await this.cache.get<string>(`otp:${code}`);
    return cachedUser === identifier;
  }

  async invalidate(code: string, identifier: string): Promise<void> {
    await this.cache.del(`otp:${code}`);
    await this.cache.del(`user_otp:${identifier}`);
  }

  async getOtpByUserIdentifier(identifier: string): Promise<string | null> {
    return await this.cache.get(`user_otp:${identifier}`);
  }
}
