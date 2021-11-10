import {
  SnapshotHubLegacyTributeProposalEntry,
  SnapshotHubProposalBase,
  SnapshotHubProposalResolverArgs,
} from './types';
import {fetchGetJSON} from '../../helpers';
import {getProposalErrorHandler} from './helpers';

/**
 * Resolves a legacy Snapshot proposal from a custom Tribute implementation.
 *
 * @param data `LegacyTributeProposalResolverData`
 * @returns `Promise<SnapshotHubProposalBase | undefined>`
 */
export async function legacyTributeProposalResolver<T>({
  apiBaseURL,
  proposalID,
  queryString,
  space,
}: SnapshotHubProposalResolverArgs): Promise<
  T extends SnapshotHubProposalBase ? any : SnapshotHubProposalBase | undefined
> {
  try {
    const proposal = await fetchGetJSON<SnapshotHubLegacyTributeProposalEntry>(
      `${apiBaseURL}/${space}/proposal/${proposalID}${queryString || ''}`
    );

    if (!proposal) {
      return undefined;
    }

    const {
      msg: {
        payload: {name, body},
      },
      data: {erc712DraftHash},
    } = Object.entries(proposal)[0][1];

    return {
      body,
      id: erc712DraftHash,
      title: name,
    };
  } catch (error) {
    if (error instanceof Error) {
      getProposalErrorHandler({error: error, proposalID});
    }

    return undefined;
  }
}
