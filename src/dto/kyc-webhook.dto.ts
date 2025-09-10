import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsArray,
} from 'class-validator';

export class KycWebhookDto {
  @IsString()
  @IsNotEmpty()
  applicantId: string;

  @IsString()
  @IsNotEmpty()
  inspectionId: string;

  @IsString()
  @IsOptional()
  correlationId?: string;

  @IsString()
  @IsNotEmpty()
  levelName: string;

  @IsString()
  @IsOptional()
  externalUserId?: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsBoolean()
  @IsOptional()
  sandboxMode?: boolean;

  @IsString()
  @IsOptional()
  reviewStatus?: string;

  @IsDateString()
  @IsOptional()
  createdAtMs?: string;

  @IsString()
  @IsOptional()
  clientId?: string;

  @IsOptional()
  reviewResult?: {
    reviewAnswer?: 'GREEN' | 'RED';
    rejectLabels?: string[];
    reviewRejectType?: 'FINAL' | 'RETRY';
    clientComment?: string;
    moderationComment?: string;
    buttonIds?: string[];
  };
}
