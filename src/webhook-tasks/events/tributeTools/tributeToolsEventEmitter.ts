import {EventEmitter} from 'events';
import StrictEventEmitter from 'strict-event-emitter-types';

import {TributeToolsFeeWebhookPayload} from '../../../http-api/middleware/tributeTools/tributeToolsFeeWebhook';

// Define `tributeToolsEventEmitter` event names and payloads
interface TributeToolsEvents {
  adminFee: TributeToolsFeeWebhookPayload;
}

// Provides a typed `EventEmitter` singleton instance for Tribute Tools events.
export const tributeToolsEventEmitter: StrictEventEmitter<
  EventEmitter,
  TributeToolsEvents
> = new EventEmitter();
