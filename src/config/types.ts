import {ACTIONS} from './actions';
import {EVENTS} from './events';

export type DaoDataEvent = {name: typeof EVENTS[number]; active?: boolean};

export type DaoDataAction = {
  name: typeof ACTIONS[number];
  webhookID: string;
  active?: boolean;
};

export type DaoData = {
  /**
   * A friendly name for the DAO
   *
   * E.g. `Tribute DAO`
   */
  friendlyName: string;
  /**
   * A public, full, base URL for the DAO
   *
   * e.g. `https://muse0.xyz`
   */
  baseURL?: string;
  /**
   * DAO's deployed `DaoRegistry.sol` contract address
   */
  registryContractAddress: string;
  /**
   * Adapter information
   */
  adapters?: Record<AdapterID, DaoDataAdapter>;
  /**
   * Events to be watched, or not, for the DAO
   */
  events: DaoDataEvent[];
  /**
   * Actions to be run, or not, for the DAO
   */
  actions: DaoDataAction[];
};

export type Daos = Record<string, DaoData>;

/**
 * bytes32 ID string
 *
 * keccak256 hash of the Adapter's readable ID.
 * i.e. `sha3('onboarding')` = "0x68c...5d89"
 *
 * @see `tribute-contracts`->`DaoFactory.sol`->`struct Adapter`
 */
export type AdapterID = string;

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
