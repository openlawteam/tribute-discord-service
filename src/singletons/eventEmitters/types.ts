import EventEmitter from 'events';
import StrictEventEmitter from 'strict-event-emitter-types/types/src';

import {ERROR_EVENT_NAME} from '.';

export interface EventEmitterEventsBase {
  [ERROR_EVENT_NAME]: unknown;
}

/**
 * Utility type to get the event names (keys) of a
 * `StrictEventEmitter`s `TEventRecord` object type
 */
export type EventEmitterEventNames<T> = T extends StrictEventEmitter<
  EventEmitter,
  infer R
>
  ? keyof R
  : never;
