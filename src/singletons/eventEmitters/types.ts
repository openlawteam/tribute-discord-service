import EventEmitter from 'events';
import StrictEventEmitter from 'strict-event-emitter-types/types/src';

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
