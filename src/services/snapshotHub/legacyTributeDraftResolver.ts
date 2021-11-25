import {
  SnapshotHubLegacyTributeDraft,
  SnapshotHubLegacyTributeDraftEntry,
  SnapshotHubProposalBase,
  SnapshotHubProposalResolverArgs,
} from './types';
import {fetchGetJSON} from '../../helpers';
import {getProposalErrorHandler} from './helpers';

/**
 * Resolves a legacy Snapshot draft from a custom Tribute ERC-712 implementation.
 *
 * @param data `SnapshotHubProposalResolverArgs`
 * @returns `Promise<SnapshotHubProposalBase | undefined>`
 */
export async function legacyTributeDraftResolver<
  R = SnapshotHubLegacyTributeDraft
>({
  apiBaseURL,
  proposalID,
  queryString,
  space,
}: SnapshotHubProposalResolverArgs): Promise<
  SnapshotHubProposalBase<R> | undefined
> {
  try {
    const draft = await fetchGetJSON<SnapshotHubLegacyTributeDraftEntry>(
      `${apiBaseURL}/${space}/draft/${proposalID}${queryString || ''}`
    );

    if (!draft) {
      return undefined;
    }

    const raw = Object.entries(draft)[0]?.[1];

    if (!raw) {
      return undefined;
    }

    const {
      msg: {
        payload: {name, body},
      },
    } = raw;

    return {
      /**
       * Helper
       */
      body,
      id: proposalID,
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
