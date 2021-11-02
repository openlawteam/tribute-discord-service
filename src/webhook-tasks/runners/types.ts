import {EventNames} from '../../config';

export type RunnerReturn = {
  /**
   * Friendly name for logging and debugging.
   * Typically, this will be from the event's data.
   */
  eventName: EventNames;
  /**
   * A callback to unsubscribe, stop polling, etc.
   */
  stop?: () => Promise<any>;
};
