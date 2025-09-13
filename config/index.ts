import * as process from 'process';

export default function configuration() {
  return {
    port: parseInt(process.env.PORT ?? '3000', 10),
    env: process.env.APP_ENV,
    url: process.env.APP_URL,
    name: process.env.APP_NAME,
    admin: process.env.ADMIN_EMAIL,

    client: { url: process.env.CLIENT_URL },
    auth: {
      secret: process.env.APP_SECRET,
    },
    redis: {
      host: process.env.REDIS_HOST ?? '',
      port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      password: process.env.REDIS_PASSWORD,
      ...(process.env.REDIS_DB ? { db: process.env.REDIS_DB } : {}),
      prefix: process.env.REDIS_PREFIX ?? 'afribloc',
    },
    resend: {
      apiKey: process.env.RESEND_API_KEY,
    },
    mail: {
      from: process.env.MAIL_FROM,
      from_name: process.env.MAIL_FROM_NAME,
    },
    imagekit: {
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
      folderImages: process.env.IMAGEKIT_FOLDER_IMAGES || '/properties/images',
      folderDocuments:
        process.env.IMAGEKIT_FOLDER_DOCUMENTS || '/properties/documents',
    },

    fireblocks: {
      apiKey: process.env.FIREBLOCKS_API_KEY,
      adminKey: process.env.FIREBLOCKS_ADMIN_KEY,
      adminId: process.env.FIREBLOCKS_ADMIN_ID,
    },
    coingecko: {
      apiKey: process.env.COIN_GECKO_API_KEY,
    },
  };
}

export interface VTPassConfig {
  url: string;
  secret_key: string;
  public_key: string;
  api_key: string;
}

export * from './database.config';
export { dataSource } from 'database/data-source';
export { config } from 'database/data-source';
export { env } from 'database/data-source';
