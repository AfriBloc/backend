export default function configuration(): {
    port: number;
    env: string | undefined;
    url: string | undefined;
    name: string | undefined;
    admin: string | undefined;
    client: {
        url: string | undefined;
    };
    auth: {
        secret: string | undefined;
    };
    redis: {
        prefix: string;
        db?: string | undefined;
        host: string;
        port: number;
        password: string | undefined;
    };
    resend: {
        apiKey: string | undefined;
    };
    mail: {
        from: string | undefined;
        from_name: string | undefined;
    };
    imagekit: {
        publicKey: string | undefined;
        privateKey: string | undefined;
        urlEndpoint: string | undefined;
        folderImages: string;
        folderDocuments: string;
    };
    fireblocks: {
        apiKey: string | undefined;
        adminKey: string | undefined;
        adminId: string | undefined;
    };
    coingecko: {
        apiKey: string | undefined;
    };
};
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
