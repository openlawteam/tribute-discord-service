import {ENVIRONMENT_VARIABLE_KEYS} from '../config';
import {getEnv} from './getEnv';

/**
 * envCheck
 *
 * Checks whether all requested environment variables
 * are set, logs the status, and returns `boolean`.
 *
 * @param {string} `envs` - Optional array of environment variable keys to check.
 *   If not provided `enum EnvironmentVariables` will be used.
 *
 * @returns `boolean`
 */
export function envCheck(
  envKeys: Partial<
    typeof ENVIRONMENT_VARIABLE_KEYS
  > = ENVIRONMENT_VARIABLE_KEYS,
  options: {noLog?: boolean} = {}
): boolean {
  const {noLog} = options;

  const areAllSet: boolean = envKeys
    .map((name) => {
      // Do not log the environment variable value!
      const value = getEnv(name);

      if (!value && !noLog) {
        console.warn(`⚠️  Missing environment variable for ${name}.`);
      }

      return value;
    })
    .every((v) => v);

  if (areAllSet && !noLog) {
    console.log('✔ All environment variables are set.');
  }

  return areAllSet;
}
