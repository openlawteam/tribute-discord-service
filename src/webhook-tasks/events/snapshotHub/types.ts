import {EventBase} from '..';
import {SnapshotHubEvents} from '../../actions/snapshotHub/types';

export interface EventSnapshotProposalWebhook<TEventEmitter>
  extends EventBase<TEventEmitter> {
  snapshotEventName: SnapshotHubEvents;
}
