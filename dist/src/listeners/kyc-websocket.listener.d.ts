import { NotificationsGateway } from '../gateways/notifications.gateway';
import { KycApprovedEvent } from '../events/kyc-approved.event';
import { KycRejectedEvent } from '../events/kyc-rejected.event';
import { KycOnHoldEvent } from '../events/kyc-on-hold.event';
export declare class KycWebSocketListener {
    private readonly notificationsGateway;
    private readonly logger;
    constructor(notificationsGateway: NotificationsGateway);
    handleKycApproved(event: KycApprovedEvent): Promise<void>;
    handleKycRejected(event: KycRejectedEvent): Promise<void>;
    handleKycOnHold(event: KycOnHoldEvent): Promise<void>;
    handleWalletCreated(event: {
        userId: string;
        walletType: string;
        address: string;
        network: string;
    }): Promise<void>;
}
