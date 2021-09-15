import {
  SnapshotHubLegacyTributeProposalEntry,
  SnapshotHubProposalBase,
} from './types';
import {fetchGetJSON} from '../../helpers';
import {getProposalErrorHandler} from './helpers';

type LegacyTributeProposalResolverData = {
  /**
   * e.g. https://some-snapshot-hub.xyz/api
   */
  apiBaseURL: string;
  /**
   * Unique Snapshot Hub space name
   *
   * e.g. `tribute`
   */
  space: string;
  /**
   * Proposal ID in Snapshot Hub
   */
  proposalID: string;
};

/**
 * Resolves a legacy Snapshot proposal from a custom Tribute implementation.
 *
 * @param data `LegacyTributeProposalResolverData`
 * @returns `Promise<SnapshotHubProposalBase | undefined>`
 */
export async function legacyTributeProposalResolver({
  apiBaseURL,
  proposalID,
  space,
}: LegacyTributeProposalResolverData): Promise<
  SnapshotHubProposalBase | undefined
> {
  try {
    const proposal = await fetchGetJSON<SnapshotHubLegacyTributeProposalEntry>(
      `${apiBaseURL}/${space}/proposal/${proposalID}?searchUniqueDraftId=true`
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
    getProposalErrorHandler({error: error as Error, proposalID});

    return undefined;
  }
}
