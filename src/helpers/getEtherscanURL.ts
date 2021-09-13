import {getEnv} from './getEnv';

const host: string = 'etherscan.io';

/**
 * Gets an Etherscan URL by `process.env.ETH_NETWORK_NAME`.
 */
export function getEtherscanURL(): string {
  const networkName = getEnv('ETH_NETWORK_NAME');

  return networkName === 'mainnet'
    ? `https://${host}`
    : `https://${networkName}.${host}`;
}
