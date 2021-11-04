import {EventBase} from '..';
import {SnapshotHubEvents} from '../../actions/snapshotHub/types';

export interface EventSnapshotProposalWebhook extends EventBase {
  snapshotEventName: SnapshotHubEvents;
}
