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
 * Alchemy WebSocket provider URL
 */
export const ALCHEMY_WS_URL: string = `wss://eth-${ETH_NETWORK_NAME}.alchemyapi.io/v2/${ALCHEMY_API_KEY}`;
