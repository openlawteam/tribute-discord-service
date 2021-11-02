import {Log} from 'web3-core/types';
import {Subscription} from 'web3-core-subscriptions';

import {EventBase} from '../../../events';

export function subscribeUnsubscribeHandler({
  name,
}: EventBase): Parameters<Subscription<Log>['unsubscribe']>[0] {
  return (error, result) => {
    if (error) {
      console.error(
        `Error while unsubscribing from ${name} event: "${error.message}"`
      );
    }

    if (result) {
      console.log(`Successfully unsubscribed from ${name} event.`);
    }
  };
}
