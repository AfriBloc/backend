"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const axios_1 = require("@nestjs/axios");
const path_1 = require("path");
const bull_1 = require("@nestjs/bull");
const serve_static_1 = require("@nestjs/serve-static");
const throttler_1 = require("@nestjs/throttler");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const config_2 = require("../config");
const process_1 = require("process");
const user_entity_1 = require("./entities/user.entity");
const verification_entity_1 = require("./entities/verification.entity");
const kyc_applicant_entity_1 = require("./entities/kyc-applicant.entity");
const kyc_webhook_event_entity_1 = require("./entities/kyc-webhook-event.entity");
const property_entity_1 = require("./entities/property.entity");
const property_portfolio_item_entity_1 = require("./entities/property-portfolio-item.entity");
const auth_controller_1 = require("./controllers/auth.controller");
const kyc_controller_1 = require("./controllers/kyc.controller");
const properties_controller_1 = require("./controllers/properties.controller");
const auth_service_1 = require("./services/auth.service");
const kyc_service_1 = require("./services/kyc.service");
const sumsub_api_service_1 = require("./services/sumsub-api.service");
const properties_service_1 = require("./services/properties.service");
const notifications_gateway_1 = require("./gateways/notifications.gateway");
const kyc_wallet_creation_listener_1 = require("./listeners/kyc-wallet-creation.listener");
const kyc_websocket_listener_1 = require("./listeners/kyc-websocket.listener");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const auth_middleware_1 = require("./middlewares/auth.middleware");
const ioredis_1 = require("ioredis");
const otp_service_1 = require("./services/otp.service");
const cache_service_1 = require("./services/cache.service");
const mail_service_1 = require("./services/mail.service");
const imagekit_service_1 = require("./services/imagekit.service");
const storage_service_1 = require("./services/storage.service");
const sub_property_entity_1 = require("./entities/sub-property.entity");
const wallet_service_1 = require("./services/wallet.service");
const fireblocks_service_1 = require("./services/fireblocks.service");
const user_wallet_entity_1 = require("./entities/user-wallet.entity");
const wallet_controller_1 = require("./controllers/wallet.controller");
const property_creation_listener_1 = require("./listeners/property-creation.listener");
const rate_controller_1 = require("./controllers/rate.controller");
const rate_service_1 = require("./services/rate.service");
const coingecko_service_1 = require("./services/coingecko.service");
const transaction_entity_1 = require("./entities/transaction.entity");
const transaction_service_1 = require("./services/transaction.service");
const transaction_reference_service_1 = require("./services/transaction-reference.service");
const property_activity_listener_1 = require("./listeners/property-activity.listener");
const portfolio_item_service_1 = require("./services/portfolio-item.service");
const portfolio_controller_1 = require("./controllers/portfolio.controller");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(auth_middleware_1.AuthMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [
                    config_1.ConfigModule.forRoot({
                        load: [config_2.default, config_2.databaseConfiguration],
                        cache: process_1.env.APP_ENV === 'production',
                        isGlobal: true,
                    }),
                ],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('database.host'),
                    port: +configService.get('database.port'),
                    url: configService.get('database.url'),
                    username: configService.get('database.username'),
                    password: configService.get('database.password'),
                    database: configService.get('database.database'),
                    synchronize: configService.get('env') !== 'production',
                    migrationsRun: true,
                    migrations: ['dist/migrations/*{.ts,.js}'],
                    logging: configService.get('env') === 'development' ? 'all' : ['error'],
                    entities: [(0, path_1.join)(__dirname, '**/*.entity{.ts,.js}')],
                    sslmode: 'require',
                }),
                inject: [config_1.ConfigService],
            }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60, limit: 100 }]),
            event_emitter_1.EventEmitterModule.forRoot({
                wildcard: true,
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'storage/public'),
            }),
            bull_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    redis: {
                        host: configService.get('REDIS_HOST'),
                        port: configService.get('REDIS_PORT'),
                        password: configService.get('REDIS_PASSWORD'),
                        db: Number(configService.get('REDIS_DB')) || 0,
                        prefix: configService.get('REDIS_PREFIX') || 'afribloc',
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                verification_entity_1.Verification,
                kyc_applicant_entity_1.KycApplicant,
                kyc_webhook_event_entity_1.KycWebhookEvent,
                property_entity_1.Property,
                property_portfolio_item_entity_1.PortfolioItem,
                sub_property_entity_1.SubProperty,
                user_wallet_entity_1.UserWallet,
                transaction_entity_1.Transaction,
            ]),
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    secret: configService.get('auth.secret') || 'default-secret-key',
                    signOptions: { expiresIn: '24h' },
                }),
                inject: [config_1.ConfigService],
            }),
            axios_1.HttpModule,
        ],
        controllers: [
            app_controller_1.AppController,
            auth_controller_1.AuthController,
            kyc_controller_1.KycController,
            properties_controller_1.PropertiesController,
            wallet_controller_1.WalletController,
            rate_controller_1.RateController,
            portfolio_controller_1.PortfolioController,
        ],
        providers: [
            app_service_1.AppService,
            auth_service_1.AuthService,
            kyc_service_1.KycService,
            properties_service_1.PropertiesService,
            sumsub_api_service_1.SumsubApiService,
            notifications_gateway_1.NotificationsGateway,
            kyc_wallet_creation_listener_1.KycWalletCreationListener,
            kyc_websocket_listener_1.KycWebSocketListener,
            jwt_strategy_1.JwtStrategy,
            otp_service_1.OtpService,
            cache_service_1.CacheService,
            mail_service_1.MailService,
            imagekit_service_1.ImageKitService,
            storage_service_1.StorageService,
            wallet_service_1.WalletService,
            fireblocks_service_1.FireblocksService,
            property_creation_listener_1.PropertyCreationListener,
            rate_service_1.RateService,
            coingecko_service_1.CoingeckoService,
            transaction_service_1.TransactionService,
            transaction_reference_service_1.TransactionReferenceService,
            property_activity_listener_1.PropertyActivityListener,
            portfolio_item_service_1.PortfolioItemService,
            {
                provide: 'REDIS_CLIENT',
                inject: [config_1.ConfigService],
                useFactory(config) {
                    const redisConfig = config.get('redis') || {};
                    const options = {
                        ...(typeof redisConfig === 'object' ? redisConfig : {}),
                        keyPrefix: 'afribloc:',
                    };
                    return new ioredis_1.default(options);
                },
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map