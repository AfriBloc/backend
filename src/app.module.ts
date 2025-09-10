import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { HttpModule } from '@nestjs/axios';
import { join } from 'path';
import { BullModule } from '@nestjs/bull';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import configuration, { databaseConfiguration } from 'config';
import { env } from 'process';

// Entity imports
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { KycApplicant } from './entities/kyc-applicant.entity';
import { KycWebhookEvent } from './entities/kyc-webhook-event.entity';
import { Property } from './entities/property.entity';
import { PortfolioItem } from './entities/property-portfolio-item.entity';

// Controller imports
import { AuthController } from './controllers/auth.controller';
import { KycController } from './controllers/kyc.controller';
import { PropertiesController } from './controllers/properties.controller';

// Service imports
import { AuthService } from './services/auth.service';
import { KycService } from './services/kyc.service';
import { SumsubApiService } from './services/sumsub-api.service';
import { PropertiesService } from './services/properties.service';

// Gateway imports
import { NotificationsGateway } from './gateways/notifications.gateway';

// Listener imports
import { KycWalletCreationListener } from './listeners/kyc-wallet-creation.listener';
import { KycWebSocketListener } from './listeners/kyc-websocket.listener';

// Other imports
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthMiddleware } from './middlewares/auth.middleware';

import Redis, { RedisOptions } from 'ioredis';
import { OtpService } from './services/otp.service';
import { CacheService } from './services/cache.service';
import { MailService } from './services/mail.service';
import { ImageKitService } from './services/imagekit.service';
import { StorageService } from './services/storage.service';
import { SubProperty } from './entities/sub-property.entity';
import { WalletService } from './services/wallet.service';
import { FireblocksService } from './services/fireblocks.service';
import { UserWallet } from './entities/user-wallet.entity';
import { WalletController } from './controllers/wallet.controller';
import { PropertyCreationListener } from './listeners/property-creation.listener';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          load: [configuration, databaseConfiguration],
          cache: env.APP_ENV === 'production',
          isGlobal: true,
        }),
      ],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: +configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        synchronize: configService.get('env') !== 'production',
        migrationsRun: true,
        migrations: ['dist/migrations/*{.ts,.js}'],
        logging: configService.get('env') === 'development' ? 'all' : ['error'],
        entities: [join(__dirname, '**/*.entity{.ts,.js}')],
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([{ ttl: 60, limit: 100 }]),
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'storage/public'),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD'),
          db: Number(configService.get('REDIS_DB')) || 0,
          prefix: configService.get<string>('REDIS_PREFIX') || 'afribloc',
        },
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      User,
      Verification,
      KycApplicant,
      KycWebhookEvent,
      Property,
      PortfolioItem,
      SubProperty,
      UserWallet,
    ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('auth.secret') || 'default-secret-key',
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
    HttpModule,
  ],
  controllers: [
    AppController,
    AuthController,
    KycController,
    PropertiesController,
    WalletController,
  ],
  providers: [
    AppService,
    AuthService,
    KycService,
    PropertiesService,
    SumsubApiService,
    NotificationsGateway,
    KycWalletCreationListener,
    KycWebSocketListener,
    JwtStrategy,
    OtpService,
    CacheService,
    MailService,
    ImageKitService,
    StorageService,
    WalletService,
    FireblocksService,
    PropertyCreationListener,
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory(config: ConfigService) {
        const redisConfig = config.get<Record<string, unknown>>('redis') || {};
        const options: RedisOptions = {
          ...(typeof redisConfig === 'object' ? redisConfig : {}),
          keyPrefix: 'afribloc:',
        };
        return new Redis(options);
      },
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
