import {EventSnapshotProposalWebhook} from '../snapshotHub/types';
import {snapshotEventEmitter} from '../../../singletons/eventEmitters';
import {SnapshotHubEvents} from '../../actions';

export const SNAPSHOT_PROPOSAL_CREATED_EVENT: EventSnapshotProposalWebhook<
  typeof snapshotEventEmitter
> = {
  eventEmitter: snapshotEventEmitter,
  name: 'SNAPSHOT_PROPOSAL_CREATED',
  snapshotEventName: SnapshotHubEvents.PROPOSAL_CREATED,
};
