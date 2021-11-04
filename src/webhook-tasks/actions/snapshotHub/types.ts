/**
 * External Snapshot Hub event names
 * @see https://docs.snapshot.org/webhooks
 */
export enum SnapshotHubEvents {
  PROPOSAL_CREATED = 'proposal/created',
  PROPOSAL_END = 'proposal/end',
  PROPOSAL_START = 'proposal/start',
}

export type SnapshotHubProposalID = `proposal/${string}`;

export type SnapshotHubEventPayload = {
  /**
   * Snapshot Hub event name
   */
  event: SnapshotHubEvents;
  /**
   * Expiration date in seconds
   */
  expire: number;
  /**
   * Proposal's ID string
   */
  id: SnapshotHubProposalID;
  /**
   * Name of Snapshot Hub space
   *
   * e.g. 'fashion'
   */
  space: string;
};
