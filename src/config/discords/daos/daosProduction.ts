import {
  SnapshotHubProposalResolverArgs,
  snapshotHubResolverSelector,
} from '../../../services/snapshotHub';
import {BURN_ADDRESS} from '../../../helpers';
import {CORE_DAO_ADAPTERS} from './daoAdapters';
import {DaoDiscordConfig} from '../../types';

/**
 * A PRODUCTION configuration mapping for DAO's this app recognises.
 *
 * If you want a DAO to interact with a Discord server,
 * start by adding its information to the enum and
 * exported mapping below.
 *
 * @todo we need to handle Moloch-based DAOs as first-class citizens
 *   - `snapshotHub.proposalResolver`
 *   - `DAO address`
 */

/**
 * Our internal DAO names
 *
 * @see `lao-backends` for most cases
 */
export const DAO_NAMES_PRODUCTION = [
  'darkhorse',
  'fashion',
  'metaverse',
  'museo',
  'music',
  'nft',
  'unicorn',
] as const;

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
  DaoDiscordConfig<typeof DAO_NAMES_PRODUCTION[number]>
> = {
  museo: {
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
    guildID: '846186721799569458',
    internalName: 'museo',
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
    applications: {
      TRIBUTE_TOOLS_BOT: {
        name: 'TRIBUTE_TOOLS_BOT',
        commands: {
          BUY: {
            resultChannelID: '936185841204744222',
            voteThresholds: new Map([
              [[0, 15], 3],
              [[15, 30], 5],
              [[30, 100], 10],
            ]),
          },
          FUND: {
            resultChannelID: '936185841204744222',
            voteThreshold: 3,
          },
          SWEEP: {
            resultChannelID: '936185841204744222',
          },
        },
      },
    },
    baseURL: 'https://reddao.xyz',
    events: [{name: 'SNAPSHOT_PROPOSAL_CREATED'}],
    friendlyName: 'Red DAO',
    guildID: '894656334069370900',
    internalName: 'fashion',
    registryContractAddress: '0x1D96d039d384d3ECCaD6f07aAB27A49408A1Cf2B',
    snapshotHub: {
      proposalResolver: DEFAULT_PROPOSAL_RESOLVER,
      space: 'fashion',
    },
  },

  /**
   * Moloch-based (v2) DAO
   */
  nft: {
    actions: [],
    applications: {
      TRIBUTE_TOOLS_BOT: {
        name: 'TRIBUTE_TOOLS_BOT',
        commands: {
          BUY: {
            resultChannelID: '938470347521540137',
            voteThresholds: new Map([
              [[0, 5], 5],
              [[5, 30], 10],
              [[30, 100], 20],
              [[100, 0], 25],
            ]),
          },
          FUND: {
            resultChannelID: '938470347521540137',
            voteThreshold: 3,
          },
          SWEEP: {
            resultChannelID: '938470347521540137',
          },
        },
      },
    },
    baseURL: 'https://flamingodao.xyz',
    events: [],
    friendlyName: 'Flamingo',
    guildID: '757641966530855074',
    internalName: 'nft',
    registryContractAddress: '',
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
    applications: {
      TRIBUTE_TOOLS_BOT: {
        name: 'TRIBUTE_TOOLS_BOT',
        commands: {
          BUY: {
            resultChannelID: '936184076107415602',
            voteThresholds: new Map([
              [[0, 15], 5],
              [[15, 30], 10],
              [[30, 100], 20],
            ]),
          },
          FUND: {
            resultChannelID: '936184076107415602',
            voteThreshold: 3,
          },
          SWEEP: {
            resultChannelID: '936184076107415602',
          },
        },
      },
    },
    baseURL: 'https://neondao.xyz',
    events: [{name: 'SNAPSHOT_PROPOSAL_CREATED'}],
    friendlyName: 'NEON DAO',
    guildID: '876601577157324840',
    internalName: 'metaverse',
    registryContractAddress: '0xa9D57fB58926d498c792733ee86d3Cc8EB8bb7A0',
    snapshotHub: {
      proposalResolver: DEFAULT_PROPOSAL_RESOLVER,
      space: 'metaverse',
    },
  },

  music: {
    actions: [],
    applications: {
      TRIBUTE_TOOLS_BOT: {
        name: 'TRIBUTE_TOOLS_BOT',
        commands: {
          BUY: {
            resultChannelID: '936433157832589402',
            voteThresholds: new Map([
              [[0, 15], 5],
              [[15, 30], 10],
              [[30, 100], 20],
            ]),
          },
          FUND: {
            resultChannelID: '936433157832589402',
            voteThreshold: 3,
          },
          SWEEP: {
            resultChannelID: '936433157832589402',
          },
        },
      },
    },
    baseURL: 'https://noisedao.xyz',
    events: [],
    friendlyName: 'Noise DAO',
    guildID: '922548287486193685',
    internalName: 'music',
    registryContractAddress: '0x56138a0012A23E90a2EEE732221188881A87d684',
    snapshotHub: {
      proposalResolver: DEFAULT_PROPOSAL_RESOLVER,
      space: 'music',
    },
  },

  unicorn: {
    actions: [],
    applications: {
      TRIBUTE_TOOLS_BOT: {
        name: 'TRIBUTE_TOOLS_BOT',
        commands: {
          BUY: {
            resultChannelID: '947877428129325056',
            voteThresholds: new Map([
              [[0, 5], 5],
              [[5, 30], 10],
              [[30, 100], 20],
              [[100, 0], 25],
            ]),
          },
          FUND: {
            resultChannelID: '947877428129325056',
            voteThreshold: 3,
          },
          SWEEP: {
            resultChannelID: '947877428129325056',
          },
        },
      },
    },
    baseURL: 'https://unicorndao.love',
    events: [],
    friendlyName: 'Unicorn DAO',
    guildID: '933511427644354661',
    internalName: 'unicorn',
    registryContractAddress: '0x0DD75fe3Fd350b43a7F1184e6f340568A37b307B',
    snapshotHub: {
      proposalResolver: DEFAULT_PROPOSAL_RESOLVER,
      space: 'unicorn',
    },
  },

  darkhorse: {
    actions: [],
    applications: {
      TRIBUTE_TOOLS_BOT: {
        name: 'TRIBUTE_TOOLS_BOT',
        commands: {
          BUY: {
            resultChannelID: '949332207162507384',
            voteThresholds: new Map([
              [[0, 15], 5],
              [[15, 30], 10],
              [[30, 100], 20],
            ]),
          },
          FUND: {
            resultChannelID: '949332207162507384',
            voteThreshold: 3,
          },
          SWEEP: {
            resultChannelID: '949332207162507384',
          },
        },
      },
    },
    baseURL: 'https://darkhorsedao.xyz',
    events: [],
    friendlyName: 'Dark Horse DAO',
    guildID: '948659070922018886',
    internalName: 'darkhorse',
    registryContractAddress: '0xa6135BD74c3bfcC58080255E207277f578Ee7C74',
    snapshotHub: {
      proposalResolver: DEFAULT_PROPOSAL_RESOLVER,
      space: 'darkhorse',
    },
  },
};
