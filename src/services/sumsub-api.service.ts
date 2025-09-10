import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { createHmac } from 'crypto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SumsubApiService {
  private readonly logger = new Logger(SumsubApiService.name);
  private readonly baseUrl: string;
  private readonly appToken: string;
  private readonly secretKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.baseUrl =
      this.configService.get<string>('SUMSUB_BASE_URL') ||
      'https://api.sumsub.com';
    this.appToken = this.configService.get<string>('SUMSUB_APP_TOKEN') || '';
    this.secretKey = this.configService.get<string>('SUMSUB_SECRET_KEY') || '';

    if (!this.appToken || !this.secretKey) {
      this.logger.error('Sumsub credentials not configured');
    }
  }

  /**
   * Generate signature for Sumsub API request
   */
  private generateSignature(
    timestamp: string,
    method: string,
    uri: string,
    body?: string,
  ): string {
    const dataToSign = timestamp + method.toUpperCase() + uri + (body || '');
    return createHmac('sha256', this.secretKey)
      .update(dataToSign)
      .digest('hex');
  }

  /**
   * Get authenticated headers for Sumsub API request
   */
  private getAuthHeaders(
    method: string,
    uri: string,
    body?: string,
  ): Record<string, string> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = this.generateSignature(timestamp, method, uri, body);

    return {
      'X-App-Token': this.appToken,
      'X-App-Access-Ts': timestamp,
      'X-App-Access-Sig': signature,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    body: string,
    signature: string,
    timestamp: string,
  ): boolean {
    try {
      const expectedSignature = createHmac('sha256', this.secretKey)
        .update(timestamp + body)
        .digest('hex');

      return signature.toLowerCase() === expectedSignature.toLowerCase();
    } catch (error) {
      this.logger.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Get applicant data from Sumsub
   */
  async getApplicantData(applicantId: string): Promise<any> {
    try {
      const uri = `/resources/applicants/${applicantId}/one`;
      const headers = this.getAuthHeaders('GET', uri);

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}${uri}`, { headers }),
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Error fetching applicant data for ${applicantId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Create applicant in Sumsub
   */
  async createApplicant(
    externalUserId: string,
    levelName: string,
  ): Promise<any> {
    try {
      const uri = '/resources/applicants';
      const body = JSON.stringify({
        externalUserId,
        levelName,
        type: 'individual',
      });

      const headers = this.getAuthHeaders('POST', uri, body);

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}${uri}`, JSON.parse(body), {
          headers,
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Error creating applicant for user ${externalUserId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Generate access token for SDK
   */
  async generateAccessToken(
    userId: string,
    levelName: string,
    ttlInSecs: number = 600,
  ): Promise<string> {
    try {
      const uri = `/resources/accessTokens?userId=${userId}&levelName=${levelName}&ttlInSecs=${ttlInSecs}`;
      const headers = this.getAuthHeaders('POST', uri);

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}${uri}`, {}, { headers }),
      );

      return response.data.token;
    } catch (error) {
      this.logger.error(
        `Error generating access token for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Generate SDK access token with applicant identifiers
   */
  async generateSdkAccessToken(
    userId: string,
    email: string,
    levelName: string = 'id-and-liveness',
    ttlInSecs: number = 600,
  ): Promise<{ token: string; userId: string }> {
    try {
      const uri = '/resources/accessTokens/sdk';
      const body = JSON.stringify({
        applicantIdentifiers: {
          email,
        },
        ttlInSecs,
        userId,
        levelName,
      });

      const headers = this.getAuthHeaders('POST', uri, body);

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}${uri}`, JSON.parse(body), {
          headers,
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Error generating SDK access token for user ${userId}:`,
        error,
      );
      throw error;
    }
  }
}
