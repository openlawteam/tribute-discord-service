import {AppEnv, NodeEnv} from '../types';

// Destructure end export environment variables
export const {
  ALCHEMY_API_KEY,
  DATABASE_URL,
  /**
   * ETH network name
   *
   * 'goerli'
   * 'kovan'
   * 'mainnet'
   * 'rinkeby'
   * 'ropsten'
   */
  ETH_NETWORK_NAME,
  POSTGRES_DB,
  POSTGRES_PASSWORD,
  POSTGRES_USER,
} = process.env;

export const NODE_ENV = process.env.NODE_ENV as NodeEnv;
export const APP_ENV = process.env.APP_ENV as AppEnv;
/**
 * Port for the HTTP server to run on inside the container.
 *
 * If running locally on docker-compose be sure to change the container port mapping.
 */
export const HTTP_API_PORT: number = 3000;

/**
 * Environment variable keys used in the app.
 * These will be used by `envCheck` by default
 * on app startup.
 */
export const ENVIRONMENT_VARIABLE_KEYS = [
  'ALCHEMY_API_KEY',
  'APP_ENV',
  'DATABASE_URL',
  'DEBUG',
  'ETH_NETWORK_NAME',
  'NODE_ENV',
  'POSTGRES_DB',
  'POSTGRES_PASSWORD',
  'POSTGRES_USER',
] as const;

/**
 * Environment variable keys used for Discord Bots.
 */
export const ENVIRONMENT_VARIABLE_KEYS_BOT_TOKENS = [
  'BOT_TOKEN_TRIBUTE_TOOLS',
] as const;

/**
 * Alchemy WebSocket provider URL
 */
export const ALCHEMY_WS_URL: string = `wss://eth-${ETH_NETWORK_NAME}.alchemyapi.io/v2/${ALCHEMY_API_KEY}`;
