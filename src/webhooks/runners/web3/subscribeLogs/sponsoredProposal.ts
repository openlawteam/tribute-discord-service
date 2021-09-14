import {
  subscribeConnectedHandler,
  subscribeErrorHandler,
  subscribeLogs,
} from '../helpers';
import {Daos} from '../../../../config/types';
import {filterDaosByActiveEvent} from '../helpers/filterDaosByActiveEvent';
import {runAll} from '../../../../helpers';
import {RunnerReturn} from '../../types';
import {SPONSORED_PROPOSAL_WEB3_LOGS} from '../../../events';
import {sponsoredProposalActionSubscribeLogs} from '../../../actions';
import {subscribeUnsubscribeHandler} from '../helpers';

/**
 * Subscribes to Tribute Contracts' DaoRegistry `SponsoredProposal` event
 * for any DAOs with `SPONSORED_PROPOSAL` event enabled, and runs any callbacks.
 *
 * @returns `RunnerReturn`
 */
export function sponsoredProposalRunnerSubscribeLogs(
  daos: Daos | undefined
): RunnerReturn {
  const {name: eventName, topics} = SPONSORED_PROPOSAL_WEB3_LOGS;

  // Only get addresses for DAOs which have the `SPONSORED_PROPOSAL` event enabled
  const filteredDaos = filterDaosByActiveEvent(daos, 'SPONSORED_PROPOSAL');

  const registryAddresses: string[] = Object.entries(filteredDaos).map(
    ([_, data]) => data.registryContractAddress
  );

  const actions = runAll([
    sponsoredProposalActionSubscribeLogs(SPONSORED_PROPOSAL_WEB3_LOGS, daos),
  ]);

  const subscription = subscribeLogs(registryAddresses, topics)
    .on('connected', subscribeConnectedHandler(SPONSORED_PROPOSAL_WEB3_LOGS))
    .on('data', actions)
    .on('error', subscribeErrorHandler(SPONSORED_PROPOSAL_WEB3_LOGS));

  const stop = async () => {
    await subscription.unsubscribe(subscribeUnsubscribeHandler(eventName));
  };

  return {
    eventName,
    stop,
  };
}
