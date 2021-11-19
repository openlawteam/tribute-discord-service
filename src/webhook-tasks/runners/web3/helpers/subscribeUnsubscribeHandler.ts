import {Subscription} from 'web3-core-subscriptions';

import {EventBase} from '../../../events';

export async function subscribeUnsubscribeHandler<T>(
  subscription: Subscription<T>,
  {name}: EventBase
): Promise<ReturnType<Subscription<T>['unsubscribe']>> {
  try {
    const result = await subscription.unsubscribe();

    console.log(`Successfully unsubscribed from ${name} event.`);

    return result;
  } catch (error) {
    console.error(
      `Error while unsubscribing from ${name} event: "${
        (error as Error).message
      }"`
    );
  }
}
