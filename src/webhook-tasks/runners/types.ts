import {EventEmitter} from 'events';
import StrictEventEmitter from 'strict-event-emitter-types/types/src';

import {EventEmitterEventNames} from '../../singletons/eventEmitters';
import {EventNames} from '../../config';

export type RunnerReturn<
  TEventEmitter extends StrictEventEmitter<EventEmitter, any> | undefined = any
> = {
  eventEmitter?: EventEmitter;
  /**
   * Friendly name for logging and debugging.
   * Typically, this will be from the event's data.
   */
  eventName: EventEmitterEventNames<TEventEmitter> | EventNames;
  /**
   * A callback to unsubscribe, stop polling, etc.
   */
  stop?: () => Promise<any>;
};
