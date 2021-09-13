import {ENVIRONMENT_VARIABLE_KEYS} from '../config';

/**
 * Returns the current environment variable value.
 * Helpful when dynamic access is desired at runtime.
 *
 * E.g. A callback function which runs and accesses `process.env`
 * vs. a static, imported config file which was imported once on app init.
 *
 * @param variableName `string`
 * @returns `string`
 */
export function getEnv(
  variableName: Partial<typeof ENVIRONMENT_VARIABLE_KEYS>[number]
): string | undefined {
  return process.env[(variableName || '').trim()];
}
