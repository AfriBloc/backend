"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfiguration = void 0;
const config_1 = require("@nestjs/config");
const data_source_1 = require("../database/data-source");
exports.databaseConfiguration = (0, config_1.registerAs)('database', () => data_source_1.config);
//# sourceMappingURL=database.config.js.map