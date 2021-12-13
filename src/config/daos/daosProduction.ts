import {
  SnapshotHubProposalResolverArgs,
  snapshotHubResolverSelector,
} from '../../services/snapshotHub';
import {BURN_ADDRESS} from '../../helpers';
import {CORE_DAO_ADAPTERS} from './daoAdapters';
import {DaoData} from '../types';

/**
 * A PRODUCTION configuration mapping for DAO's this app recognises.
 *
 * If you want a DAO to interact with a Discord server,
 * start by adding its information to the enum and
 * exported mapping below.
 */

export const DAO_NAMES_PRODUCTION = ['fashion', 'metaverse', 'muse0'] as const;

const SNAPSHOT_HUB_API_URL: string =
  'https://snapshot-hub-erc712.thelao.io/api';

const DEFAULT_PROPOSAL_RESOLVER = async <R = any>(
  args: SnapshotHubProposalResolverArgs
) => {
  return snapshotHubResolverSelector<R>({
    ...args,
    apiBaseURL: SNAPSHOT_HUB_API_URL,
  });
};

export const DAOS_PRODUCTION: Record<
  typeof DAO_NAMES_PRODUCTION[number],
  DaoData
> = {
  muse0: {
    actions: [
      {
        name: 'SPONSORED_PROPOSAL_WEBHOOK',
        webhookID: '888443179039354941',
      },
      {
        name: 'SNAPSHOT_DRAFT_CREATED_WEBHOOK',
        webhookID: '913488993767784488',
      },
      {
        name: 'SNAPSHOT_PROPOSAL_CREATED_WEBHOOK',
        webhookID: '888443179039354941',
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
    baseURL: 'https://muse0.xyz',
    events: [{name: 'SPONSORED_PROPOSAL'}, {name: 'SNAPSHOT_PROPOSAL_CREATED'}],
    friendlyName: 'Muse0',
    registryContractAddress: '0x7c8B281C56f7ef9b8099D3F491AF24DC2C2e3ee0',
    snapshotHub: {
      proposalResolver: DEFAULT_PROPOSAL_RESOLVER,
      space: 'museo',
    },
  },

  fashion: {
    actions: [
      {
        name: 'SNAPSHOT_PROPOSAL_CREATED_WEBHOOK',
        webhookID: '919977631540207646',
      },
    ],
    adapters: {
      [BURN_ADDRESS]: {
        friendlyName: 'Governance',
        baseURLPath: 'governance',
      },
    },
    baseURL: 'https://reddao.xyz',
    events: [{name: 'SNAPSHOT_PROPOSAL_CREATED'}],
    friendlyName: 'Red DAO',
    registryContractAddress: '0x1D96d039d384d3ECCaD6f07aAB27A49408A1Cf2B',
    snapshotHub: {
      proposalResolver: DEFAULT_PROPOSAL_RESOLVER,
      space: 'fashion',
    },
  },

  metaverse: {
    actions: [
      {
        name: 'SNAPSHOT_PROPOSAL_CREATED_WEBHOOK',
        webhookID: '919978975059673138',
      },
    ],
    adapters: {
      [BURN_ADDRESS]: {
        friendlyName: 'Governance',
        baseURLPath: 'governance',
      },
    },
    baseURL: 'https://neondao.xyz',
    events: [{name: 'SNAPSHOT_PROPOSAL_CREATED'}],
    friendlyName: 'NEON DAO',
    registryContractAddress: '0xa9D57fB58926d498c792733ee86d3Cc8EB8bb7A0',
    snapshotHub: {
      proposalResolver: DEFAULT_PROPOSAL_RESOLVER,
      space: 'metaverse',
    },
  },
};
