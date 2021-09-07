import {
  subscribeConnectedHandler,
  subscribeErrorHandler,
  subscribeLogs,
} from '../helpers';
import {RunnerReturn} from '../../types';
import {SPONSORED_PROPOSAL_WEB3_LOGS} from '../../../events';
import {subscribeUnsubscribeHandler} from '../helpers/subscribeUnsubscribeHandler';

/**
 * Subscribes to Tribute Contracts' DaoRegistry `SponsoredProposal` event
 * and runs any callbacks.
 *
 * @returns `RunnerReturn`
 */
export function sponsoredProposal(): RunnerReturn {
  const {name, addresses, topics} = SPONSORED_PROPOSAL_WEB3_LOGS;

  const subscription = subscribeLogs(addresses, topics)
    .on('connected', subscribeConnectedHandler(name))
    .on('data', (d) => console.log(d))
    .on('error', subscribeErrorHandler(name));

  const stop = async () => {
    await subscription.unsubscribe(subscribeUnsubscribeHandler(name));
  };

  return {
    name,
    stop,
  };
}
