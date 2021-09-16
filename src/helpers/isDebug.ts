import {normalizeString, getEnv} from '.';

export function isDebug(): boolean {
  return normalizeString(getEnv('DEBUG')) === 'true';
}
