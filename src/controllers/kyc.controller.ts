import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  Headers,
  HttpStatus,
  HttpException,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { KycService } from '../services/kyc.service';
import { SumsubApiService } from '../services/sumsub-api.service';
import { KycWebhookDto } from '../dto/kyc-webhook.dto';
import { User } from '../entities/user.entity';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('kyc')
export class KycController {
  private readonly logger = new Logger(KycController.name);

  constructor(
    private readonly kycService: KycService,
    private readonly sumsubApiService: SumsubApiService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Sumsub webhook endpoint
   * This endpoint receives webhook notifications from Sumsub
   */
  @Post('webhook')
  async handleWebhook(
    @Body() webhookData: KycWebhookDto,
    @Headers('x-sumsub-signature') signature?: string,
    @Headers('x-sumsub-timestamp') timestamp?: string,
  ): Promise<{ status: string; message: string }> {
    this.logger.log(
      `Received webhook: ${webhookData.type} for applicant ${webhookData.applicantId}`,
    );

    try {
      // Verify webhook signature (optional but recommended for production)
      if (signature && timestamp) {
        const bodyString = JSON.stringify(webhookData);
        const isValid = this.sumsubApiService.verifyWebhookSignature(
          bodyString,
          signature,
          timestamp,
        );

        if (!isValid) {
          this.logger.warn('Invalid webhook signature');
          throw new HttpException(
            'Invalid webhook signature',
            HttpStatus.UNAUTHORIZED,
          );
        }
      }

      // Process the webhook
      await this.kycService.processWebhook(webhookData);

      return {
        status: 'success',
        message: 'Webhook processed successfully',
      };
    } catch (error) {
      this.logger.error('Error processing webhook:', error);
      throw new HttpException(
        'Failed to process webhook',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get user's KYC status
   */
  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getKycStatus(@Request() req: any) {
    try {
      const status = await this.kycService.getUserKycStatus(req.user.id);
      return {
        status: 'success',
        data: status,
      };
    } catch (error) {
      this.logger.error('Error getting KYC status:', error);
      throw new HttpException(
        'Failed to get KYC status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate SumSub access token for KYC SDK
   */
  @Post('access-token')
  @UseGuards(JwtAuthGuard)
  async generateAccessToken(@Request() req: any) {
    try {
      // Get user details
      const user = await this.userRepository.findOne({
        where: { id: req.user.id },
        select: ['id', 'email'],
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Validate required fields
      if (!user.email) {
        throw new HttpException(
          'User email is required for KYC verification',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Generate access token
      const tokenResponse = await this.sumsubApiService.generateSdkAccessToken(
        user.id,
        user.email,
        'id-and-liveness',
        600,
      );

      this.logger.log(`Generated access token for user ${user.id}`);

      return {
        status: 'success',
        data: tokenResponse,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Error generating access token:', error);
      throw new HttpException(
        'Failed to generate access token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Health check endpoint
   */
  @Get('health')
  healthCheck() {
    return {
      status: 'success',
      message: 'KYC service is healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
