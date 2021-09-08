import {ETH_NETWORK_NAME} from '../config';

const host: string = 'etherscan.io';

/**
 * Etherscan URL
 */
export const ETHERSCAN_URL: string =
  ETH_NETWORK_NAME === 'mainnet'
    ? `https://${host}`
    : `https://${ETH_NETWORK_NAME}.${host}`;
