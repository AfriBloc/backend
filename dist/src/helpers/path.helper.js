"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRootDir = void 0;
exports.getResourcesDir = getResourcesDir;
exports.getSecretsDir = getSecretsDir;
const path_1 = require("path");
const process = require("process");
const getRootDir = (path) => {
    const cwd = process.cwd();
    if (path)
        return (0, path_1.join)(cwd, path);
    return cwd;
};
exports.getRootDir = getRootDir;
function getResourcesDir(path) {
    return (0, exports.getRootDir)(path ? (0, path_1.join)('resources', path) : 'resources');
}
function getSecretsDir(path) {
    return (0, exports.getRootDir)(path ? (0, path_1.join)('src/secrets', path) : 'src/secrets');
}
//# sourceMappingURL=path.helper.js.map