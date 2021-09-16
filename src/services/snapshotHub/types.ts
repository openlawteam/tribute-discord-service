export type SnapshotProposalID = string;

/**
 * A base type for any Snapshot Hub proposal data structure
 *
 * Used as a way to unify different results from different API's.
 */
export interface SnapshotHubProposalBase {
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
}

export type SnapshotHubLegacyProposalEntry = Record<
  SnapshotProposalID,
  SnapshotHubLegacyProposal
>;

export type SnapshotHubLegacyTributeProposalEntry = Record<
  SnapshotProposalID,
  SnapshotHubLegacyTributeProposal
>;

/**
 * A basic Snapshot Hub proposal type for legacy
 * versions of Snapshot Hub.
 */
export interface SnapshotHubLegacyProposal {
  msg: {
    payload: {
      body: string;
      name: string;
    };
  };
}

export interface SnapshotHubLegacyTributeProposal
  extends SnapshotHubLegacyProposal {
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
