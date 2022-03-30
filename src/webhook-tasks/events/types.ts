import EventEmitter from 'events';
import StrictEventEmitter from 'strict-event-emitter-types';

import {EventNames} from '../../config';

export interface EventBase<TEventEmitter = any> {
  eventEmitter?: TEventEmitter extends StrictEventEmitter<EventEmitter, any>
    ? TEventEmitter
    : undefined;
  name: EventNames;
}
