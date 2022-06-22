import {EventEmitter} from 'events';
import StrictEventEmitter from 'strict-event-emitter-types';

import {ERROR_EVENT_NAME, EventEmitterEventsBase} from '.';
import {SnapshotHubEventPayload} from '../../webhook-tasks/actions';

// Define `tributeToolsEventEmitter` event names and payloads
interface SnapshotEvents extends EventEmitterEventsBase {
  proposalCreated: SnapshotHubEventPayload;
}

// Provides a typed `EventEmitter` singleton instance for Snapshot events
export const snapshotEventEmitter: StrictEventEmitter<
  EventEmitter,
  SnapshotEvents
> = new EventEmitter();

// Handle 'error' event
snapshotEventEmitter.on(ERROR_EVENT_NAME, (error) => {
  console.error(
    `An \`error\` event was emitted on \`snapshotEventEmitter\`: ${error}`
  );
});
