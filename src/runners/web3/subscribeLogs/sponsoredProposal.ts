import {RunnerStop} from '../../types';
import {SPONSORED_PROPOSAL_WEB3_LOGS} from '../../../events';
import {subscribeConnectedHandler, subscribeLogs} from '../helpers';

/**
 * Subscribes to Tribute Contracts' DaoRegistry `SponsoredProposal` event.
 *
 * @returns
 */
export function sponsoredProposal(): RunnerStop {
  const {name, addresses, topics} = SPONSORED_PROPOSAL_WEB3_LOGS;

  const subscription = subscribeLogs(addresses, topics)
    .on('connected', subscribeConnectedHandler(name))
    .on('error', (error) => console.log('ERRZ:', error.message));

  return subscription.unsubscribe;
}
