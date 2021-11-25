import {
  SnapshotHubProposalResolverArgs,
  snapshotHubResolverSelector,
} from '../../services/snapshotHub';
import {BURN_ADDRESS} from '../../helpers';
import {CORE_DAO_ADAPTERS} from './daoAdapters';
import {DaoData} from '../types';

/**
 * A DEVELOPMENT configuration mapping for DAO's this app recognises.
 *
 * If you want a DAO to interact with a Discord server,
 * start by adding its information to the enum and
 * exported mapping below.
 */

export const DAO_NAMES_DEVELOPMENT = ['muse0', 'tribute'] as const;

const SNAPSHOT_HUB_API_URL: string =
  'https://snapshot-hub-erc712.dev.thelao.io/api';

export const DAOS_DEVELOPMENT: Record<
  typeof DAO_NAMES_DEVELOPMENT[number],
  DaoData
> = {
  tribute: {
    actions: [
      {
        name: 'SPONSORED_PROPOSAL_WEBHOOK',
        webhookID: '886976872611729439',
      },
      {
        name: 'SNAPSHOT_PROPOSAL_CREATED_WEBHOOK',
        webhookID: '886976872611729439',
      },
    ],
    adapters: {
      [CORE_DAO_ADAPTERS.onboarding]: {
        friendlyName: 'onboarding',
        baseURLPath: 'membership',
      },
      [BURN_ADDRESS]: {
        friendlyName: 'Governance',
        baseURLPath: 'governance',
      },
    },
    baseURL: 'https://demo.tributedao.com',
    events: [{name: 'SPONSORED_PROPOSAL'}, {name: 'SNAPSHOT_PROPOSAL_CREATED'}],
    friendlyName: 'Tribute DAO [DEV]',
    registryContractAddress: '0xf5af0d9c3e4091a48925902eaAB2982e44E7a4C5',
    snapshotHub: {
      proposalResolver: async <R = any>(
        args: SnapshotHubProposalResolverArgs
      ) => {
        return snapshotHubResolverSelector<R>({
          ...args,
          apiBaseURL: SNAPSHOT_HUB_API_URL,
        });
      },
      space: 'tribute',
    },
  },

  muse0: {
    actions: [
      {
        name: 'SPONSORED_PROPOSAL_WEBHOOK',
        webhookID: '886976872611729439',
      },
      {
        name: 'SNAPSHOT_PROPOSAL_CREATED_WEBHOOK',
        webhookID: '886976872611729439',
      },
    ],
    adapters: {
      [CORE_DAO_ADAPTERS['tribute-nft']]: {
        friendlyName: 'tribute-nft',
        baseURLPath: 'curation',
      },
      [BURN_ADDRESS]: {
        friendlyName: 'Governance',
        baseURLPath: 'governance',
      },
    },
    baseURL: 'https://develop--muse0.netlify.app',
    events: [{name: 'SPONSORED_PROPOSAL'}, {name: 'SNAPSHOT_PROPOSAL_CREATED'}],
    friendlyName: 'Muse0 [DEV]',
    registryContractAddress: '0x00637869d068a5A5fB6fa42d7c025d1dCbd14f99',
    snapshotHub: {
      proposalResolver: async <R = any>(
        args: SnapshotHubProposalResolverArgs
      ) => {
        return snapshotHubResolverSelector<R>({
          ...args,
          apiBaseURL: SNAPSHOT_HUB_API_URL,
        });
      },
      space: 'museo',
    },
  },
};
