import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class TransactionReferenceService {
  private readonly chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  constructor() {}

  generate(length: number = 20): string {
    const randomBytes = crypto.randomBytes(length);
    return Array.from(randomBytes)
      .map((byte) => this.chars[byte % this.chars.length])
      .join('');
  }
}
