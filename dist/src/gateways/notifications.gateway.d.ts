import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    server: Server;
    private readonly logger;
    private userSockets;
    constructor(jwtService: JwtService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    sendKycStatusUpdate(userId: string, data: {
        status: string;
        message: string;
        timestamp: Date;
    }): void;
    sendWalletCreatedNotification(userId: string, data: {
        walletType: string;
        address: string;
        network: string;
        timestamp: Date;
    }): void;
    sendNotification(userId: string, notification: {
        type: string;
        title: string;
        message: string;
        data?: any;
        timestamp: Date;
    }): void;
    isUserOnline(userId: string): boolean;
    getOnlineUsersCount(): number;
}
