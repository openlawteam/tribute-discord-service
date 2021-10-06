import {Log, LogsOptions} from 'web3-core/types';
import {Subscription} from 'web3-core-subscriptions';

import {web3} from '../../../../singletons';

/**
 * subscribeLogs
 *
 * A wrapper to around `web3.eth.subscribe('logs')` with `fromBlock`
 * set to `latest`.
 *
 * To unsubscribe, call `unsubscribe(callback?)` on the return value.
 *
 * @param SubscribeLogsOptions
 * @returns `Subscription<Log>`
 * @see https://web3js.readthedocs.io/en/v1.4.0/web3-eth-subscribe.html#subscribe-logs
 */
export function subscribeLogs(
  address: LogsOptions['address'],
  topics: LogsOptions['topics']
): Subscription<Log> {
  return web3.eth.subscribe('logs', {
    fromBlock: 'latest',
    address,
    topics,
  });
}
