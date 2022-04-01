import {
  SnapshotHubEventPayload,
  SnapshotHubEvents,
} from '../../actions/snapshotHub/types';
import {
  legacyTributeDraftCreatedAction,
  legacyTributeGovernanceProposalCreatedAction,
} from '../../actions/snapshotHub';
import {Daos} from '../../../config';
import {getDaoDiscordConfigs} from '../../../services';
import {runAll} from '../../../helpers';
import {SNAPSHOT_PROPOSAL_CREATED_EVENT} from '../../events/snapshotHub';

type SnapshotHubEventActions = ((
  s: SnapshotHubEventPayload,
  d: Daos
) => Promise<any>)[];

export async function snapshotProposalEventRunner(
  payload: SnapshotHubEventPayload
): Promise<void> {
  let actions: SnapshotHubEventActions | undefined;

  const daos = await getDaoDiscordConfigs();

  switch (payload.event) {
    case SnapshotHubEvents.PROPOSAL_CREATED:
      actions = getProposalCreatedActions(daos);
      break;
    default:
      actions = undefined;
  }

  if (!actions) return;

  runAll(actions)(payload);
}

/**
 * Returns callbacks to respond to a `propsal/created` Snapshot Hub webhook event.
 * Will run for any DAOs with `SNAPSHOT_PROPOSAL_CREATED_WEBHOOK` action enabled,
 * and runs any callbacks.
 *
 * @returns `SnapshotHubEventActions`
 *
 * @see https://docs.snapshot.org/webhooks
 */
function getProposalCreatedActions(
  daos: Daos | undefined
): SnapshotHubEventActions {
  return [
    legacyTributeDraftCreatedAction(SNAPSHOT_PROPOSAL_CREATED_EVENT, daos),
    legacyTributeGovernanceProposalCreatedAction(
      SNAPSHOT_PROPOSAL_CREATED_EVENT,
      daos
    ),
  ];
}
