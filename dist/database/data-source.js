"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSource = exports.config = exports.env = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.env = process.env;
exports.config = {
    type: 'postgres',
    host: exports.env.DATABASE_HOST ?? '127.0.0.1',
    url: exports.env.DATABASE_URL,
    port: exports.env.DATABASE_PORT ? parseInt(exports.env.DATABASE_PORT, 10) : 5432,
    synchronize: exports.env.APP_ENV === 'development',
    logging: exports.env.APP_ENV === 'development' ? 'all' : ['error'],
    username: exports.env.DATABASE_USERNAME ?? '',
    password: exports.env.DATABASE_PASSWORD ?? '',
    database: exports.env.DATABASE_NAME,
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/database/migrations/*{.ts,.js}'],
    sslmode: 'require',
};
exports.dataSource = new typeorm_1.DataSource(exports.config);
//# sourceMappingURL=data-source.js.map