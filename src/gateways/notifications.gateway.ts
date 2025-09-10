import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3001',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets = new Map<string, string>(); // userId -> socketId

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        this.logger.warn('WebSocket connection attempted without token');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // Store user socket mapping
      this.userSockets.set(userId, client.id);
      client.data.userId = userId;

      // Join user to their own room
      await client.join(`user_${userId}`);

      this.logger.log(`User ${userId} connected to WebSocket`);
    } catch (error) {
      this.logger.error('WebSocket authentication failed:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const userId = client.data.userId;
    if (userId) {
      this.userSockets.delete(userId);
      this.logger.log(`User ${userId} disconnected from WebSocket`);
    }
  }

  /**
   * Send KYC status update to user
   */
  sendKycStatusUpdate(userId: string, data: {
    status: string;
    message: string;
    timestamp: Date;
  }): void {
    this.server.to(`user_${userId}`).emit('kyc_status_update', data);
    this.logger.log(`Sent KYC status update to user ${userId}: ${data.status}`);
  }

  /**
   * Send wallet creation notification to user
   */
  sendWalletCreatedNotification(userId: string, data: {
    walletType: string;
    address: string;
    network: string;
    timestamp: Date;
  }): void {
    this.server.to(`user_${userId}`).emit('wallet_created', data);
    this.logger.log(`Sent wallet creation notification to user ${userId}: ${data.walletType}`);
  }

  /**
   * Send general notification to user
   */
  sendNotification(userId: string, notification: {
    type: string;
    title: string;
    message: string;
    data?: any;
    timestamp: Date;
  }): void {
    this.server.to(`user_${userId}`).emit('notification', notification);
    this.logger.log(`Sent notification to user ${userId}: ${notification.type}`);
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  /**
   * Get online users count
   */
  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }
}
