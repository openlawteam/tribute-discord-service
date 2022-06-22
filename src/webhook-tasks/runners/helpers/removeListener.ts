import EventEmitter from 'events';
import StrictEventEmitter from 'strict-event-emitter-types/types/src';

import {EventEmitterEventNames} from '../../../singletons/eventEmitters';

export function removeListener<TEventEmitter = any>({
  eventEmitter,
  listener,
  name,
}: {
  eventEmitter: TEventEmitter extends
    | StrictEventEmitter<EventEmitter, any>
    | undefined
    ? TEventEmitter
    : undefined;
  listener: (...args: any[]) => any;
  name: EventEmitterEventNames<TEventEmitter>;
}): void {
  try {
    eventEmitter?.removeListener(name, listener);

    console.log(`Removed \`${name}\` event listener: \`${listener.name}\`.`);
  } catch (error) {
    console.error(
      `An error occurred while removing the event listener for \`${name}\`.`
    );
  }
}
