import {EventSnapshotProposalWebhook} from '.';
import {SnapshotHubEvents} from '../../actions/snapshotHub/types';

export const SNAPSHOT_PROPOSAL_CREATED_EVENT: EventSnapshotProposalWebhook = {
  name: 'SNAPSHOT_PROPOSAL_CREATED',
  snapshotEventName: SnapshotHubEvents.PROPOSAL_CREATED,
};
