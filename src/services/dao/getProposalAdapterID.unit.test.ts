import {BYTES32_FIXTURE, ETH_ADDRESS_FIXTURE} from '../../../test';
import {getProposalAdapterID} from './getProposalAdapterID';
import {mockWeb3Provider} from '../../../test/setup';
import {web3} from '../../singletons';

describe('getProposalAdapterID unit tests', () => {
  test("should return a proposal's adapter address", async () => {
    // Mock respsonse for `proposals`
    mockWeb3Provider.injectResult(
      web3.eth.abi.encodeParameters(
        ['address', 'uint256'],
        [ETH_ADDRESS_FIXTURE, 1]
      )
    );

    // Mock respsonse for `inverseAdapters`
    mockWeb3Provider.injectResult(
      web3.eth.abi.encodeParameters(
        ['bytes32', 'uint256'],
        [BYTES32_FIXTURE, 1]
      )
    );

    expect(
      await getProposalAdapterID(
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000'
      )
    ).toBe(BYTES32_FIXTURE);
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
