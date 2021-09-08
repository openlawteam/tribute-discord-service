import {ETH_NETWORK_NAME} from '../config';
import {ETHERSCAN_URL} from './etherscanURL';

describe('etherscanURL unit tests', () => {
  // Will return a URL derived from our `ETH_NETWORK_NAME` in `.env.test`
  test('should return an etherscan URL', () => {
    expect(ETHERSCAN_URL).toBe(`https://${ETH_NETWORK_NAME}.etherscan.io`);
  });
});
