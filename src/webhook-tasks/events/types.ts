import EventEmitter from 'events';
import StrictEventEmitter from 'strict-event-emitter-types';

import {EventNames} from '../../config';

export interface EventBase<
  TEventEmitter extends StrictEventEmitter<EventEmitter, any> = any
> {
  eventEmitter?: TEventEmitter;
  name: EventNames;
}
