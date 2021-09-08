import {EventBase} from '../../../events';

export function subscribeErrorHandler(
  eventBase: EventBase
): (e: Error) => void {
  return (error: Error) => {
    console.log(
      `Error from Web3 subscription for ${eventBase.name} (type: ${eventBase.type}).\n\nError: "${error.message}"`
    );
  };
}
