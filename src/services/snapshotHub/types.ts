import {SNAPSHOT_HUB_RESOLVERS} from '../../config';

export type SnapshotProposalID = string;

export enum SnapshotHubMessageType {
  DRAFT = 'draft',
  PROPOSAL = 'proposal',
}

/**
 * A base type for any Snapshot Hub proposal data structure
 *
 * Used as a way to unify different results from different API's.
 */
export type SnapshotHubProposalBase<T = any> = {
  /**
   * Body content of the Snapshot Hub Proposal
   */
  body: string;
  /**
   * ID of the Snapshot Hub proposal
   */
  id: SnapshotProposalID;
  /**
   * Title of the Snapshot Hub Proposal
   */
  title: string;
  /**
   *
   */
  raw: T;
};

export type SnapshotHubProposalResolverArgs = {
  /**
   * e.g. https://some-snapshot-hub.xyz/api
   */
  apiBaseURL?: string;
  /**
   * Proposal ID in Snapshot Hub
   */
  proposalID: string;
  /**
   * Query string for the legacy Tribute Snapshot Hub API
   *
   * e.g. `searchUniqueDraftId=true&...`
   */
  queryString?: `?${string}`;
  /**
   * Resolver to use (may not be available depending on DAO configs)
   */
  resolver?: typeof SNAPSHOT_HUB_RESOLVERS[number];
  /**
   * Unique Snapshot Hub space name
   *
   * e.g. `tribute`
   */
  space: string;
};

export type SnapshotHubLegacyProposalEntry = Record<
  SnapshotProposalID,
  SnapshotHubLegacyProposal
>;

export type SnapshotHubLegacyTributeProposalEntry = Record<
  SnapshotProposalID,
  SnapshotHubLegacyTributeProposal
>;

export type SnapshotHubLegacyTributeDraftEntry = Record<
  SnapshotProposalID,
  SnapshotHubLegacyTributeDraft
>;

/**
 * A basic Snapshot Hub proposal type for legacy
 * versions of Snapshot Hub.
 */
export interface SnapshotHubLegacyProposal {
  msg: {
    payload: {
      body: string;
      /**
       * Voting end time in seconds
       */
      end: number;
      name: string;
      /**
       * Ethereum block number
       */
      snapshot: number;
      /**
       * Voting start time in seconds
       */
      start: number;
    };
    type: SnapshotHubMessageType;
  };
}

/**
 * A basic Snapshot Hub draft type for legacy
 * versions of Snapshot Hub.
 */
export interface SnapshotHubLegacyDraft {
  msg: {
    payload: {
      body: string;
      name: string;
    };
    /**
     * Created timestamp in seconds
     */
    timestamp: string;
    type: SnapshotHubMessageType;
  };
}

export interface SnapshotHubLegacyTributeProposal
  extends SnapshotHubLegacyProposal {
  /**
   * Proposal's Tribute DAO Adapter ID
   */
  actionId: string;
  /**
   * Partial type of legacy Tribute Snapshot Hub response
   * customised for erc712 signatures
   */
  data: {
    /**
     * Tribute Snapshot Hub has the concept of a `draft` type, whose ID
     * can be used to relate to a `proposal` type. For nearly all DAO
     * proposals the actual DAO proposal's ID is the Snapshot Hub `draft` ID.
     */
    erc712DraftHash: string;
  };
}

export interface SnapshotHubLegacyTributeDraft extends SnapshotHubLegacyDraft {
  /**
   * Proposal's Tribute DAO Adapter ID
   */
  actionId: string;
  /**
   * Partial type of legacy Tribute Snapshot Hub response
   * customised for erc712 signatures
   */
  data: {
    /**
     * Has the draft been sponsored (i.e. proposal created from a draft)?
     */
    sponsored: boolean;
  };
}
