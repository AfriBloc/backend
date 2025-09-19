export declare const databaseConfiguration: (() => {
    type: string;
    host: string;
    url: string | undefined;
    port: number;
    synchronize: boolean;
    logging: string | string[];
    username: string;
    password: string;
    database: string | undefined;
    entities: string[];
    migrations: string[];
    sslmode: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    type: string;
    host: string;
    url: string | undefined;
    port: number;
    synchronize: boolean;
    logging: string | string[];
    username: string;
    password: string;
    database: string | undefined;
    entities: string[];
    migrations: string[];
    sslmode: string;
}>;
