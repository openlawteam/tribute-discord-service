import {DaoData} from '../../src/config/types';
import {BYTES32_FIXTURE, ETH_ADDRESS_FIXTURE} from './constants';
import {legacyTributeProposalResolver} from '../../src/services/snapshotHub';

export const FAKE_DAOS_FIXTURE: Record<string, DaoData> = {
  test: {
    actions: [
      {
        name: 'SPONSORED_PROPOSAL_WEBHOOK',
        webhookID: '886976872611729439',
      },
    ],
    adapters: {
      [BYTES32_FIXTURE]: {
        friendlyName: 'onboarding',
        baseURLPath: 'membership',
      },
    },
    baseURL: 'http://localhost:3000',
    events: [{name: 'SPONSORED_PROPOSAL'}],
    friendlyName: 'Tribute DAO [Test]',
    registryContractAddress: ETH_ADDRESS_FIXTURE,
    snapshotHub: {
      proposalResolver: async (args) =>
        await legacyTributeProposalResolver({
          ...args,
          // @see `docker-host` in `docker-compose.dev.yml`
          apiBaseURL: 'http://docker-host:8081/api',
        }),
      space: 'tribute',
    },
  },

  test1: {
    actions: [
      {
        name: 'SNAPSHOT_PROPOSAL_CREATED_WEBHOOK',
        webhookID: '776974872622729189',
      },
    ],
    adapters: {
      [BYTES32_FIXTURE]: {
        friendlyName: 'onboarding',
        baseURLPath: 'membership',
      },
    },
    baseURL: 'http://localhost:3000',
    events: [{name: 'SNAPSHOT_PROPOSAL_CREATED'}],
    friendlyName: 'Mingo DAO [Test]',
    registryContractAddress: ETH_ADDRESS_FIXTURE,
    snapshotHub: {
      proposalResolver: async (args) =>
        await legacyTributeProposalResolver({
          ...args,
          // @see `docker-host` in `docker-compose.dev.yml`
          apiBaseURL: 'http://docker-host:8081/api',
        }),
      space: 'mingo',
    },
  },
};
