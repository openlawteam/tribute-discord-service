import {Log} from 'web3-core/types';
import {Subscription} from 'web3-core-subscriptions';

export function subscribeUnsubscribeHandler(
  subscriptionName: string
): Parameters<Subscription<Log>['unsubscribe']>[0] {
  return (error, result) => {
    if (error) {
      console.error(
        `Error while unsubscribing from ${subscriptionName} event: "${error.message}"`
      );
    }

    if (result) {
      console.log(`Successfully unsubscribed from ${subscriptionName} event.`);
    }
  };
}
