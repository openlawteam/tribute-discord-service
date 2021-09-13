import {DEFAULT_EMPTY_BYTES32, DEFAULT_ETH_ADDRESS} from '../../../test';
import {getProposalAdapterID} from './getProposalAdapterID';
import {mockWeb3Provider} from '../../../test/setup';
import {web3} from '../../alchemyWeb3Instance';

describe('getProposalAdapterID unit tests', () => {
  test("should return a proposal's adapter address", async () => {
    // Mock respsonse for `proposals`
    mockWeb3Provider.injectResult(
      web3.eth.abi.encodeParameters(
        ['address', 'uint256'],
        [DEFAULT_ETH_ADDRESS, 1]
      )
    );

    // Mock respsonse for `inverseAdapters`
    mockWeb3Provider.injectResult(
      web3.eth.abi.encodeParameters(
        ['bytes32', 'uint256'],
        [DEFAULT_EMPTY_BYTES32, 1]
      )
    );

    expect(
      await getProposalAdapterID(
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000'
      )
    ).toBe(DEFAULT_EMPTY_BYTES32);
  });

  test('should throw an error when call fails', async () => {
    mockWeb3Provider.injectError({code: 1234, message: 'Some bad error'});

    try {
      await getProposalAdapterID(
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000'
      );
    } catch (error) {
      expect((error as Error).message).toMatch(/some bad error/i);
    }
  });
});
