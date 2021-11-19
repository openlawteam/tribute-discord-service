import {SnapshotHubProposalID} from '../types';

/**
 * Strip the `proposal/` prefix from the Snapshot Hub event's `id` value,
 * and return only the ID.
 *
 * @param id `SnapshotHubProposalID`
 * @returns `string`
 */
export function takeSnapshotProposalID(id: SnapshotHubProposalID) {
  return id.replace('proposal/', '');
}
