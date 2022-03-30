import EventEmitter from 'events';
import StrictEventEmitter from 'strict-event-emitter-types/types/src';

import {EventEmitterEventNames} from '../../../singletons/eventEmitters';

export function removeListener<
  TEventEmitter extends StrictEventEmitter<EventEmitter, any> | undefined = any
>({
  eventEmitter,
  listener,
  name,
}: {
  eventEmitter: TEventEmitter;
  listener: (...args: any[]) => any;
  name: EventEmitterEventNames<TEventEmitter>;
}): void {
  try {
    eventEmitter?.removeListener(name, listener);

    const functionName: string = listener.name || 'anonymous';

    console.log(`Removed \`${name}\` event listener: \`${functionName}\`.`);
  } catch (error) {
    console.error(
      `An error occurred while calling removing the event listener for \`${name}\`.`
    );
  }
}
