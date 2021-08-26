import {createAlchemyWeb3} from '@alch/alchemy-web3';

import {ALCHEMY_WS_URL} from './config';

/**
 * Web3 instance singleton
 */

export const web3 = createAlchemyWeb3(ALCHEMY_WS_URL);
