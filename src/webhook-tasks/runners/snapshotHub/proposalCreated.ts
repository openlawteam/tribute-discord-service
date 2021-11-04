import {
  SnapshotHubEventPayload,
  SnapshotHubEvents,
} from '../../actions/snapshotHub/types';
import {Daos} from '../../../config';
import {getDaos} from '../../../services';
import {runAll} from '../../../helpers';
import {SNAPSHOT_PROPOSAL_CREATED_EVENT} from '../../events/snapshotHub';
import {snapshotProposalCreatedWebhookAction} from '../../actions/snapshotHub/proposalCreated';

type SnapshotHubEventActions = ((
  s: SnapshotHubEventPayload,
  d: Daos
) => Promise<any>)[];

export async function snapshotProposalEventRunner(
  payload: SnapshotHubEventPayload
): Promise<void> {
  let actions: SnapshotHubEventActions;

  const daos = await getDaos();

  switch (payload.event) {
    case SnapshotHubEvents.PROPOSAL_CREATED:
      actions = getProposalCreatedActions(daos);
      break;
    default:
      throw new Error(
        `No actions were found to run for Snapshot Hub event ${payload.event}.`
      );
  }

  if (!actions) return;

  runAll(actions);
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
    snapshotProposalCreatedWebhookAction(SNAPSHOT_PROPOSAL_CREATED_EVENT, daos),
  ];
}
