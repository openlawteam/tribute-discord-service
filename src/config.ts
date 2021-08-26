// Destructure end export environment variables
export const {
  ALCHEMY_API_KEY,
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
  DATABASE_URL,
  NODE_ENV,
  POSTGRES_DB,
  POSTGRES_PASSWORD,
  POSTGRES_USER,
} = process.env;

/**
 * Environment variable keys used in the app.
 * These will be used by `envCheck` by default
 * on app startup.
 */
export const ENVIRONMENT_VARIABLE_KEYS: string[] = [
  'ALCHEMY_API_KEY',
  'ETH_NETWORK_NAME',
  'DATABASE_URL',
  'NODE_ENV',
  'POSTGRES_DB',
  'POSTGRES_PASSWORD',
  'POSTGRES_USER',
];

/**
 * Alchemy WebSocket provider URL
 */
export const ALCHEMY_WS_URL: string = `wss://eth-${ETH_NETWORK_NAME}.alchemyapi.io/v2/${ALCHEMY_API_KEY}`;
