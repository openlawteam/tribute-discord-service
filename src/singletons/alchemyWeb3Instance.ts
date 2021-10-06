import {createAlchemyWeb3} from '@alch/alchemy-web3';

import {ALCHEMY_WS_URL} from '../config';

/**
 * Web3 instance singleton
 *
 * Alchemy's Web3 wrapper provides sturdier WebSocket connections
 * and handles missed events.
 *
 * @see https://docs.alchemy.com/alchemy/documentation/alchemy-web3
 */

export const web3 = createAlchemyWeb3(ALCHEMY_WS_URL);
