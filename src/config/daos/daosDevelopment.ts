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

export const DAO_NAMES_DEVELOPMENT = [
  'fashion',
  'metaverse',
  'muse0',
  'tribute',
] as const;

const SNAPSHOT_HUB_API_URL: string =
  'https://snapshot-hub-erc712.dev.thelao.io/api';

const TRIBUTE_DISCORD_TEST_WEBHOOK_ID: string = '886976872611729439';
const TRIBUTE_DISCORD_GUILD_ID: string = '722525233755717762';

const DEFAULT_PROPOSAL_RESOLVER = async <R = any>(
  args: SnapshotHubProposalResolverArgs
) => {
  return snapshotHubResolverSelector<R>({
    ...args,
    apiBaseURL: SNAPSHOT_HUB_API_URL,
  });
};

export const DAOS_DEVELOPMENT: Record<
  typeof DAO_NAMES_DEVELOPMENT[number],
  DaoData
> = {
  tribute: {
    actions: [
      {
        name: 'SPONSORED_PROPOSAL_WEBHOOK',
        webhookID: TRIBUTE_DISCORD_TEST_WEBHOOK_ID,
      },
      {
        name: 'SNAPSHOT_PROPOSAL_CREATED_WEBHOOK',
        webhookID: TRIBUTE_DISCORD_TEST_WEBHOOK_ID,
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
    applications: {
      TRIBUTE_TOOLS_BOT: {
        name: 'TRIBUTE_TOOLS_BOT',
        resultChannelID: '933653038718128198',
      },
    },
    baseURL: 'https://demo.tributedao.com',
    events: [{name: 'SPONSORED_PROPOSAL'}, {name: 'SNAPSHOT_PROPOSAL_CREATED'}],
    friendlyName: 'Tribute DAO [DEV]',
    guildID: TRIBUTE_DISCORD_GUILD_ID,
    registryContractAddress: '0xf5af0d9c3e4091a48925902eaAB2982e44E7a4C5',
    snapshotHub: {
      proposalResolver: DEFAULT_PROPOSAL_RESOLVER,
      space: 'tribute',
    },
  },

  muse0: {
    actions: [
      {
        name: 'SPONSORED_PROPOSAL_WEBHOOK',
        webhookID: TRIBUTE_DISCORD_TEST_WEBHOOK_ID,
      },
      {
        name: 'SNAPSHOT_DRAFT_CREATED_WEBHOOK',
        webhookID: TRIBUTE_DISCORD_TEST_WEBHOOK_ID,
      },
      {
        name: 'SNAPSHOT_PROPOSAL_CREATED_WEBHOOK',
        webhookID: TRIBUTE_DISCORD_TEST_WEBHOOK_ID,
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
    guildID: TRIBUTE_DISCORD_GUILD_ID,
    registryContractAddress: '0x00637869d068a5A5fB6fa42d7c025d1dCbd14f99',
    snapshotHub: {
      proposalResolver: DEFAULT_PROPOSAL_RESOLVER,
      space: 'museo',
    },
  },

  fashion: {
    actions: [
      {
        name: 'SNAPSHOT_PROPOSAL_CREATED_WEBHOOK',
        webhookID: TRIBUTE_DISCORD_TEST_WEBHOOK_ID,
      },
    ],
    adapters: {
      [BURN_ADDRESS]: {
        friendlyName: 'Governance',
        baseURLPath: 'governance',
      },
    },
    baseURL: 'https://develop--reddao.netlify.app',
    events: [{name: 'SNAPSHOT_PROPOSAL_CREATED'}],
    friendlyName: 'Red DAO [DEV]',
    guildID: TRIBUTE_DISCORD_GUILD_ID,
    registryContractAddress: '0xeE2873D8E5380405eAF079491f7A6322fd35Db1f',
    snapshotHub: {
      proposalResolver: DEFAULT_PROPOSAL_RESOLVER,
      space: 'fashion',
    },
  },

  metaverse: {
    actions: [
      {
        name: 'SNAPSHOT_PROPOSAL_CREATED_WEBHOOK',
        webhookID: TRIBUTE_DISCORD_TEST_WEBHOOK_ID,
      },
    ],
    adapters: {
      [BURN_ADDRESS]: {
        friendlyName: 'Governance',
        baseURLPath: 'governance',
      },
    },
    baseURL: 'https://develop--neondao.netlify.app',
    events: [{name: 'SNAPSHOT_PROPOSAL_CREATED'}],
    friendlyName: 'NEON DAO [DEV]',
    guildID: TRIBUTE_DISCORD_GUILD_ID,
    registryContractAddress: '0xB9CC072170b5407d37f1d2Bd07BEf7441e1942Dc',
    snapshotHub: {
      proposalResolver: DEFAULT_PROPOSAL_RESOLVER,
      space: 'metaverse',
    },
  },
};
