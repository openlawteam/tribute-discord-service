import {BURN_ADDRESS} from '../../helpers';
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
      await getProposalAdapterID({
        daoAddress: BURN_ADDRESS,
        proposalID: BYTES32_FIXTURE,
      })
    ).toBe(BYTES32_FIXTURE);
  });

  test('should return an adapter address when `adapterAddress` provided', async () => {
    // Mock respsonse for `inverseAdapters`
    mockWeb3Provider.injectResult(
      web3.eth.abi.encodeParameters(
        ['bytes32', 'uint256'],
        [BYTES32_FIXTURE, 1]
      )
    );

    expect(
      await getProposalAdapterID({
        daoAddress: BURN_ADDRESS,
        adapterAddress: BURN_ADDRESS,
      })
    ).toBe(BYTES32_FIXTURE);

    // Mock respsonse for `inverseAdapters`
    mockWeb3Provider.injectResult(
      web3.eth.abi.encodeParameters(
        ['bytes32', 'uint256'],
        [BYTES32_FIXTURE, 1]
      )
    );

    expect(
      await getProposalAdapterID({
        daoAddress: BURN_ADDRESS,
        adapterAddress: BURN_ADDRESS,
        proposalID: BYTES32_FIXTURE,
      })
    ).toBe(BYTES32_FIXTURE);
  });

  test('should return `undefined` if an adapter address === `BURN_ADDRESS`', async () => {
    // Mock respsonse for `proposals`
    mockWeb3Provider.injectResult(
      web3.eth.abi.encodeParameters(['address', 'uint256'], [BURN_ADDRESS, 1])
    );

    // Mock respsonse for `inverseAdapters`
    mockWeb3Provider.injectResult(
      web3.eth.abi.encodeParameters(
        ['bytes32', 'uint256'],
        [BYTES32_FIXTURE, 1]
      )
    );

    expect(
      await getProposalAdapterID({
        daoAddress: BURN_ADDRESS,
        proposalID: BYTES32_FIXTURE,
      })
    ).toBe(undefined);
  });

  test('should return `undefined` if an adapter address is an empty `string`', async () => {
    expect(
      await getProposalAdapterID({
        daoAddress: BURN_ADDRESS,
      })
    ).toBe(undefined);
  });

  test('should throw an error when call fails', async () => {
    mockWeb3Provider.injectError({code: 1234, message: 'Some bad error'});

    try {
      await getProposalAdapterID({
        daoAddress: BURN_ADDRESS,
        proposalID: BYTES32_FIXTURE,
      });
    } catch (error) {
      expect((error as Error).message).toMatch(/some bad error/i);
    }
  });
});
