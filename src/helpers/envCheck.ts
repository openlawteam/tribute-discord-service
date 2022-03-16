import {ENVIRONMENT_VARIABLE_KEYS} from '../config';
import {getEnv} from './getEnv';

/**
 * envCheck
 *
 * Checks whether all requested environment variables
 * are set, logs the status, and returns `boolean`.
 *
 * @returns `boolean`
 */
export function envCheck(): boolean {
  const areAllSet: boolean = ENVIRONMENT_VARIABLE_KEYS.map((name) => {
    // Do not log the environment variable value!
    const value = getEnv(name);

    if (!value) {
      console.warn(`⚠️  Missing required environment variable for ${name}.`);
    }

    return value;
  }).every((v) => v);

  if (areAllSet) {
    console.log('✔ All required environment variables are set.');
  }

  return areAllSet;
}
