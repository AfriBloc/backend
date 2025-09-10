import { join } from 'path';
import * as process from 'process';

export const getRootDir = (path?: string): string => {
  const cwd = process.cwd();
  if (path) return join(cwd, path);

  return cwd;
};

export function getResourcesDir(path?: string): string {
  return getRootDir(path ? join('resources', path) : 'resources');
}

export function getSecretsDir(path?: string): string {
  return getRootDir(path ? join('src/secrets', path) : 'src/secrets');
}
