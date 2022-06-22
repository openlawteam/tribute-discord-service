/**
 * Strip the `proposal/` prefix from the Snapshot Hub event's `id` value,
 * and return only the ID.
 *
 * @param id
 * @returns Clean proposal ID
 */
export function takeSnapshotProposalID(id: string) {
  return id.replace('proposal/', '');
}
