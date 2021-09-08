import {
  subscribeConnectedHandler,
  subscribeErrorHandler,
  subscribeLogs,
} from '../helpers';
import {runAll} from '../../../../helpers';
import {RunnerReturn} from '../../types';
import {SPONSORED_PROPOSAL_WEB3_LOGS} from '../../../events';
import {sponsoredProposalActionSubscribeLogs} from '../../../actions';
import {subscribeUnsubscribeHandler} from '../helpers/subscribeUnsubscribeHandler';

/**
 * Subscribes to Tribute Contracts' DaoRegistry `SponsoredProposal` event
 * and runs any callbacks.
 *
 * @returns `RunnerReturn`
 */
export function sponsoredProposalRunnerSubscribeLogs(): RunnerReturn {
  const {name, addresses, topics} = SPONSORED_PROPOSAL_WEB3_LOGS;

  const actions = runAll([
    sponsoredProposalActionSubscribeLogs(SPONSORED_PROPOSAL_WEB3_LOGS),
  ]);

  const subscription = subscribeLogs(addresses, topics)
    .on('connected', subscribeConnectedHandler(SPONSORED_PROPOSAL_WEB3_LOGS))
    .on('data', actions)
    .on('error', subscribeErrorHandler(SPONSORED_PROPOSAL_WEB3_LOGS));

  const stop = async () => {
    await subscription.unsubscribe(subscribeUnsubscribeHandler(name));
  };

  return {
    name,
    stop,
  };
}
