import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsGateway } from '../gateways/notifications.gateway';
import { KycApprovedEvent } from '../events/kyc-approved.event';
import { KycRejectedEvent } from '../events/kyc-rejected.event';
import { KycOnHoldEvent } from '../events/kyc-on-hold.event';

@Injectable()
export class KycWebSocketListener {
  private readonly logger = new Logger(KycWebSocketListener.name);

  constructor(private readonly notificationsGateway: NotificationsGateway) {}

  @OnEvent('kyc.approved')
  async handleKycApproved(event: KycApprovedEvent): Promise<void> {
    this.logger.log(`Sending KYC approval notification to user: ${event.userId}`);

    try {
      // Send KYC status update
      this.notificationsGateway.sendKycStatusUpdate(event.userId, {
        status: 'approved',
        message: 'Your KYC verification has been approved! Your wallet will be created shortly.',
        timestamp: new Date(),
      });

      // Send general notification
      this.notificationsGateway.sendNotification(event.userId, {
        type: 'kyc_approved',
        title: 'KYC Verification Approved',
        message: 'Congratulations! Your identity verification has been successfully completed.',
        data: {
          applicantId: event.applicantId,
          userData: event.userData,
        },
        timestamp: new Date(),
      });

      this.logger.log(`KYC approval notification sent to user ${event.userId}`);
    } catch (error) {
      this.logger.error(`Error sending KYC approval notification to user ${event.userId}:`, error);
    }
  }

  @OnEvent('kyc.rejected')
  async handleKycRejected(event: KycRejectedEvent): Promise<void> {
    this.logger.log(`Sending KYC rejection notification to user: ${event.userId}`);

    try {
      // Send KYC status update
      this.notificationsGateway.sendKycStatusUpdate(event.userId, {
        status: 'rejected',
        message: `Your KYC verification was declined: ${event.rejectionReason}`,
        timestamp: new Date(),
      });

      // Send general notification
      this.notificationsGateway.sendNotification(event.userId, {
        type: 'kyc_rejected',
        title: 'KYC Verification Declined',
        message: event.reviewRejectType === 'RETRY' 
          ? 'Your verification was declined but you can resubmit your documents.'
          : 'Your verification was declined. Please contact support for assistance.',
        data: {
          applicantId: event.applicantId,
          rejectionReason: event.rejectionReason,
          rejectLabels: event.rejectLabels,
          reviewRejectType: event.reviewRejectType,
        },
        timestamp: new Date(),
      });

      this.logger.log(`KYC rejection notification sent to user ${event.userId}`);
    } catch (error) {
      this.logger.error(`Error sending KYC rejection notification to user ${event.userId}:`, error);
    }
  }

  @OnEvent('kyc.onHold')
  async handleKycOnHold(event: KycOnHoldEvent): Promise<void> {
    this.logger.log(`Sending KYC on-hold notification to user: ${event.userId}`);

    try {
      // Send KYC status update
      this.notificationsGateway.sendKycStatusUpdate(event.userId, {
        status: 'on_hold',
        message: 'Your KYC verification is currently under manual review.',
        timestamp: new Date(),
      });

      // Send general notification
      this.notificationsGateway.sendNotification(event.userId, {
        type: 'kyc_on_hold',
        title: 'KYC Under Review',
        message: 'Your verification is being reviewed by our team. We will update you once complete.',
        data: {
          applicantId: event.applicantId,
          reason: event.reason,
        },
        timestamp: new Date(),
      });

      this.logger.log(`KYC on-hold notification sent to user ${event.userId}`);
    } catch (error) {
      this.logger.error(`Error sending KYC on-hold notification to user ${event.userId}:`, error);
    }
  }

  @OnEvent('wallet.created')
  async handleWalletCreated(event: { userId: string; walletType: string; address: string; network: string }): Promise<void> {
    this.logger.log(`Sending wallet creation notification to user: ${event.userId}`);

    try {
      // Send wallet creation notification
      this.notificationsGateway.sendWalletCreatedNotification(event.userId, {
        walletType: event.walletType,
        address: event.address,
        network: event.network,
        timestamp: new Date(),
      });

      // Send general notification
      this.notificationsGateway.sendNotification(event.userId, {
        type: 'wallet_created',
        title: 'Wallet Created',
        message: `Your ${event.walletType} wallet has been successfully created.`,
        data: {
          walletType: event.walletType,
          address: event.address,
          network: event.network,
        },
        timestamp: new Date(),
      });

      this.logger.log(`Wallet creation notification sent to user ${event.userId}`);
    } catch (error) {
      this.logger.error(`Error sending wallet creation notification to user ${event.userId}:`, error);
    }
  }
}
