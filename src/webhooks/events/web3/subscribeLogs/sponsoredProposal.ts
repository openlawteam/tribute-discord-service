import {AbiItem} from 'web3-utils/types';

import {EventWeb3Logs} from '../types';
import {getLazyDefaultImport} from '../../../../helpers';
import {SPONSORED_PROPOSAL_EVENT_SIGNATURE_HASH} from '../eventSignatures';

const lazyABIImport = () => import('../../../../abis/tribute/DaoRegistry.json');

export const SPONSORED_PROPOSAL_WEB3_LOGS: EventWeb3Logs = {
  lazyABI: getLazyDefaultImport<AbiItem[]>(lazyABIImport),
  name: 'SPONSORED_PROPOSAL',
  topics: [SPONSORED_PROPOSAL_EVENT_SIGNATURE_HASH],
};
