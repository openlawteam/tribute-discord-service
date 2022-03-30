import EventEmitter from 'events';
import StrictEventEmitter from 'strict-event-emitter-types/types/src';
import {EventBase} from '..';

export interface EventTributeTools<
  TEventEmitter extends StrictEventEmitter<EventEmitter, any>
> extends EventBase<TEventEmitter> {}
