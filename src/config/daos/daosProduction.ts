import {BURN_ADDRESS} from '../../helpers';
import {CORE_DAO_ADAPTERS} from './daoAdapters';
import {DaoData} from '../types';
import {legacyTributeProposalResolver, SnapshotHubProposalResolverArgs} from '../../services/snapshotHub';

/**
 * A PRODUCTION configuration mapping for DAO's this app recognises.
 *
 * If you want a DAO to interact with a Discord server,
 * start by adding its information to the enum and
 * exported mapping below.
 */

export const DAO_NAMES_PRODUCTION = ['muse0'] as const;

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
      proposalResolver: async <R = any>(
        args: SnapshotHubProposalResolverArgs
      ) => {
        const {resolver} = args;

        const DEFAULT_ARGS = {
          ...args,
          apiBaseURL: 'https://snapshot-hub-erc712.thelao.io/api',
        };

        switch (resolver) {
          case 'LEGACY_TRIBUTE':
            return await legacyTributeProposalResolver<R>(DEFAULT_ARGS);

          default:
            return await legacyTributeProposalResolver<R>(DEFAULT_ARGS);
        }
      },
      space: 'museo',
    },
  },
};
