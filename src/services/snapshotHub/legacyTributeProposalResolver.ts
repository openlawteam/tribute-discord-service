import {
  SnapshotHubLegacyTributeProposal,
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
export async function legacyTributeProposalResolver<
  R = SnapshotHubLegacyTributeProposal
>({
  apiBaseURL,
  proposalID,
  queryString,
  space,
}: SnapshotHubProposalResolverArgs): Promise<
  SnapshotHubProposalBase<R> | undefined
> {
  try {
    const proposal = await fetchGetJSON<SnapshotHubLegacyTributeProposalEntry>(
      `${apiBaseURL}/${space}/proposal/${proposalID}${queryString || ''}`
    );

    if (!proposal) {
      return undefined;
    }

    const raw = Object.entries(proposal)[0][1];

    const {
      msg: {
        payload: {name, body},
      },
      data: {erc712DraftHash},
    } = raw;

    return {
      /**
       * Helper
       */
      body,
      id: erc712DraftHash,
      title: name,
      /**
       * Raw response
       */
      raw: raw as any as R,
    };
  } catch (error) {
    if (error instanceof Error) {
      getProposalErrorHandler({error: error, proposalID});
    }

    return undefined;
  }
}
