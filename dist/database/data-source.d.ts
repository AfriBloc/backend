import { DataSource } from 'typeorm';
export declare const env: NodeJS.ProcessEnv;
export declare const config: {
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
};
export declare const dataSource: DataSource;
