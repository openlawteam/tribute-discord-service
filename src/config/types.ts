import {
  SnapshotHubProposalBase,
  SnapshotHubProposalResolverArgs,
} from '../services/snapshotHub/types';
import {ACTIONS, EVENTS, APPLICATIONS, APPLICATION_COMMANDS} from '.';

export type ActionNames = typeof ACTIONS[number];
export type ApplicationNames = typeof APPLICATIONS[number];
export type EventNames = typeof EVENTS[number];

export interface DiscordConfig {
  /**
   * Actions to be run, or not
   */
  actions: ActionConfig[];
  /**
   * Applications (bots)
   */
  applications?: Partial<DaoDataApplicationsMap>;
  /**
   * A public, full, base URL
   *
   * e.g. `https://tributelabs.xyz`
   */
  baseURL?: string;
  /**
   * Events to be watched, or not
   */
  events: EventConfig[];
  /**
   * A friendly name for display
   *
   * E.g. `Tribute DAO`, `Tribute Labs`
   */
  friendlyName: string;
  /**
   * Discord guild (server) ID
   */
  guildID: string;
}

export type EventConfig = {name: EventNames; active?: boolean};

export type ActionConfig = {
  name: ActionNames;
  webhookID: string;
  active?: boolean;
};

export type Daos = Record<string, DaoDiscordConfig>;

export interface DaoDiscordConfig<InternalNames = string>
  extends DiscordConfig {
  /**
   * Adapter information
   */
  adapters?: Record<AdapterID, DaoDataAdapter>;
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
}

export type DaoDataAdapter = {
  /**
   * A base URL path, without `/`.
   *
   * Used together with `DaoDiscordConfig['baseURL']` to form
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
  TRIBUTE_TOOLS_BOT: DaoDataApplication<TributeToolsCommandsConfiguration>;
};

/**
 * Base interface for application configs
 */
export interface DaoDataApplication<CommandsConfiguration> {
  name: typeof APPLICATIONS[number];
  commands: ExtractApplicationCommandFields<CommandsConfiguration>;
}

/**
 * Tribute Tools Application Commands configuration
 */
export type TributeToolsCommandsConfiguration = {
  BUY: {
    /**
     * ```
     * [
     *   [[ethMin, ethMax], requiredVotes],
     *   [[ethMin, ethMax], requiredVotes],
     *   // ...
     * ]
     * ```
     */
    voteThresholds: Map<[number, number], number>;
    // Discord channel ID to send a message on poll threshold reached.
    resultChannelID: string;
  };

  FUND: {
    voteThreshold: number;
    // Discord channel ID to send a message on poll threshold reached.
    resultChannelID: string;
  };

  SWEEP: {
    // Discord channel ID to send a message on poll end.
    resultChannelID: string;
  };
};

/**
 * Helper for creating a type for command configurations
 * where *only* the `APPLICATION_COMMANDS` keys are taken
 * which exist in the configuration type.
 *
 * @see https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#key-remapping-via-as
 */
type ExtractApplicationCommandFields<Type> = {
  [Property in keyof Type as Extract<
    Property,
    typeof APPLICATION_COMMANDS[number]
  >]: Type[Property];
};
