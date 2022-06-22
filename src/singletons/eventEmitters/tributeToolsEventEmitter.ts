import {EventEmitter} from 'events';
import StrictEventEmitter from 'strict-event-emitter-types';

import {ERROR_EVENT_NAME, EventEmitterEventsBase} from '.';
import {TributeToolsFeeWebhookPayload} from '../../http-api/middleware/tributeTools/tributeToolsFeeWebhook';

// Define `tributeToolsEventEmitter` event names and payloads
interface TributeToolsEvents extends EventEmitterEventsBase {
  adminFee: TributeToolsFeeWebhookPayload;
}

// Provides a typed `EventEmitter` singleton instance for Tribute Tools events
export const tributeToolsEventEmitter: StrictEventEmitter<
  EventEmitter,
  TributeToolsEvents
> = new EventEmitter();

// Handle 'error' event
tributeToolsEventEmitter.on(ERROR_EVENT_NAME, (error) => {
  console.error(
    `An \`error\` event was emitted on \`tributeToolsEventEmitter\`: ${error}`
  );
});
