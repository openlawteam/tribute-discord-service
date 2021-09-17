import {EVENTS} from '../../config/events';

export interface EventBase {
  name: typeof EVENTS[number];
}
