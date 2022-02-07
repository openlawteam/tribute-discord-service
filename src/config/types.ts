import {
  SnapshotHubProposalBase,
  SnapshotHubProposalResolverArgs,
} from '../services/snapshotHub/types';
import {ACTIONS, EVENTS, APPLICATIONS} from '.';

export type ActionNames = typeof ACTIONS[number];
export type ApplicationNames = typeof APPLICATIONS[number];
export type EventNames = typeof EVENTS[number];

export type DaoDataEvent = {name: EventNames; active?: boolean};

export type DaoDataAction = {
  name: typeof ACTIONS[number];
  webhookID: string;
  active?: boolean;
};

export type Daos = Record<string, DaoData>;

export type DaoData<InternalNames = string> = {
  /**
   * Adapter information
   */
  adapters?: Record<AdapterID, DaoDataAdapter>;
  /**
   * Actions to be run, or not, for the DAO
   */
  actions: DaoDataAction[];
  /**
   * Applications (bots)
   */
  applications?: Partial<DaoDataApplicationsMap>;
  /**
   * A public, full, base URL for the DAO
   *
   * e.g. `https://muse0.xyz`
   */
  baseURL?: string;
  /**
   * Events to be watched, or not, for the DAO
   */
  events: DaoDataEvent[];
  /**
   * A friendly name for the DAO
   *
   * E.g. `Tribute DAO`
   */
  friendlyName: string;
  /**
   * Discord guild (server) ID
   */
  guildID: string;
  /**
   * Internal DAO name
   *
   * @see `lao-backends` for most cases
   */
  internalName: InternalNames;
  /**
   * Snapshot Hub data
   */
  snapshotHub?: DaoDataSnapshotHub;
  /**
   * DAO's deployed `DaoRegistry.sol` contract address
   */
  registryContractAddress: string;
};

export type DaoDataAdapter = {
  /**
   * A base URL path, without `/`.
   *
   * Used together with `DaoData['baseURL']` to form
   * a URL for links (i.e. used by `actions` in Discord webhook content).
   *
   * This works for simple URL structures (i.e. `tribute-ui`).
   * For less predictable URLs some kind of URL resolver may need to be added to this app.
   *
   * e.g. `${baseURL}/${basePath}/${proposalId}`
   */
  baseURLPath?: string;
  /**
   * A friendly name for the Adapter.
   *
   * Can be the text which was hashed to create
   * an Adapter ID (keccak256 hash) in the DAO, or
   * any descriptive Adapter name.
   */
  friendlyName: string;
};

/**
 * bytes32 ID string
 *
 * keccak256 hash of the Adapter's readable ID,
 * or an Ethereum address.
 *
 * i.e. `sha3('onboarding')` = "0x68c...5d89"
 *
 * @see `tribute-contracts`->`DaoFactory.sol`->`struct Adapter`
 */
export type AdapterID = string;

export type DaoDataSnapshotHub = {
  /**
   * Resolves `SnapshotProposalBase`
   *
   * It is generic as different DAOs may use different
   * Snapshot Hubs - the API's may not be standard.
   *
   * i.e. GraphQL for recent core Snapshot Hub; custom API from Tribute team.
   */
  proposalResolver: <T = any>(
    args: SnapshotHubProposalResolverArgs
  ) => Promise<SnapshotHubProposalBase<T> | undefined>;
  /**
   * Snapshot Hub `space` name
   */
  space: string;
};

/**
 * Application-specific config mappings
 */
export type DaoDataApplicationsMap = {
  TRIBUTE_TOOLS_BOT: FloorSweeperBotApplication;
};

/**
 * Base interface for application configs
 */
export interface DaoDataApplication {
  name: typeof APPLICATIONS[number];
}

/**
 * Floor Sweeper Poll application
 */
export interface FloorSweeperBotApplication extends DaoDataApplication {
  /**
   * Discord channel ID to send a message on poll end with the content:
   *
   * - poll question
   * - poll result
   * - sweep action button
   */
  resultChannelID: string;
}
