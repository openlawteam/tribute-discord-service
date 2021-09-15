import {DaoData} from '../../src/config/types';
import {DEFAULT_EMPTY_BYTES32, DEFAULT_ETH_ADDRESS} from './constants';
import {legacyTributeProposalResolver} from '../../src/services/snapshotHub';

export const FAKE_DAOS: Record<string, DaoData> = {
  test: {
    actions: [
      {name: 'SPONSORED_PROPOSAL_WEBHOOK', webhookID: '886976872611729439'},
    ],
    adapters: {
      [DEFAULT_EMPTY_BYTES32]: {
        friendlyName: 'onboarding',
        baseURLPath: 'membership',
      },
    },
    baseURL: 'http://localhost:3000',
    events: [{name: 'SPONSORED_PROPOSAL'}],
    friendlyName: 'Tribute DAO [Test]',
    registryContractAddress: DEFAULT_ETH_ADDRESS,
    snapshotHub: {
      proposalResolver: async (proposalID, space) =>
        await legacyTributeProposalResolver({
          // @see `docker-host` in `docker-compose.dev.yml`
          apiBaseURL: 'http://docker-host:8081/api',
          proposalID,
          space,
        }),
      space: 'tribute',
    },
  },
};
