import {ETH_NETWORK_NAME} from '../config';
import {getEnv} from './getEnv';
import {getEtherscanURL} from './getEtherscanURL';

describe('getEtherscanURL unit tests', () => {
  // Will return a URL derived from our `ETH_NETWORK_NAME` in `.env.test`
  test('should return an etherscan URL', () => {
    expect(getEtherscanURL()).toBe(`https://${ETH_NETWORK_NAME}.etherscan.io`);
  });

  test('should return a mainnet etherscan URL', () => {
    const originalETHNetworkName = getEnv('ETH_NETWORK_NAME');

    process.env.ETH_NETWORK_NAME = 'mainnet';

    expect(getEtherscanURL()).toBe(`https://etherscan.io`);

    // Cleanup
    process.env.ETH_NETWORK_NAME = originalETHNetworkName;
  });
});
