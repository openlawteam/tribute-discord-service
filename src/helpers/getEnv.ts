import {
  ENVIRONMENT_VARIABLE_KEYS,
  ENVIRONMENT_VARIABLE_KEYS_BOT_TOKENS,
  ENVIRONMENT_VARIABLE_KEYS_OPTIONAL,
} from '../config';

type AvailableEnv =
  | typeof ENVIRONMENT_VARIABLE_KEYS[number]
  | typeof ENVIRONMENT_VARIABLE_KEYS_BOT_TOKENS[number]
  | typeof ENVIRONMENT_VARIABLE_KEYS_OPTIONAL[number];

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
export function getEnv(variableName: AvailableEnv): string | undefined {
  return process.env[(variableName || '').trim()];
}
