import {EventBase} from '../../../events';

export function subscribeConnectedHandler(
  eventBase: EventBase
): (sid: string) => void {
  return (subscriptionId: string) => {
    console.log(
      `Connected to Web3 subscriptions for ${eventBase.name}. Subscription ID: ${subscriptionId}.`
    );
  };
}
