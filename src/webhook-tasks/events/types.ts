import EventEmitter from 'events';
import StrictEventEmitter from 'strict-event-emitter-types';

import {EventEmitterEventNames} from '../../singletons/eventEmitters';
import {EventNames} from '../../config';

export interface EventBase<
  TEventEmitter extends StrictEventEmitter<EventEmitter, any> = any
> {
  eventEmitter?: TEventEmitter;
  name: EventEmitterEventNames<TEventEmitter> | EventNames;
}
