import {AbiItem} from 'web3-utils/types';
import {LogsOptions} from 'web3-core/types';

import {EventBase} from '../types';

export interface EventWeb3Logs extends EventBase {
  /**
   * Lazy load the ABI file.
   *
   * An ABI is needed when decoding logs `data`.
   */
  lazyABI: () => Promise<AbiItem[]>;
  /**
   * Contract address (or addresses) to subscribe to logs for.
   */
  addresses: LogsOptions['address'];
  /**
   * For our purposes, the first topic index should be a `sha3(EVENT_SIGNATURE)`;
   * we should always be looking for a specific event - avoids crazy logs!
   *
   * @see https://docs.alchemy.com/alchemy/guides/eth_getlogs#a-note-on-specifying-topic-filters
   */
  topics: LogsOptions['topics'];
}
