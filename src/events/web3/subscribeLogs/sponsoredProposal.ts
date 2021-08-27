import {EventWeb3Logs} from '../types';
import {getLazyABI} from '../../../helpers/getLazyABI';
import {NODE_ENV} from '../../../config';
import {NodeEnv} from '../../../types';
import {RegistryTypes} from '../../types';
import {SPONSORED_PROPOSAL_EVENT_SIGNATURE_HASH} from '../eventSignatures';

const ADDRESS_BY_ENV: Partial<Record<NodeEnv, string[]>> = {
  development: [''],
  production: [''],
};

export const SPONSORED_PROPOSAL_WEB3_LOGS: EventWeb3Logs = {
  name: 'Sponsored Proposal',
  type: RegistryTypes.WEB3_LOGS,
  address: ADDRESS_BY_ENV[NODE_ENV],
  lazyABI: getLazyABI('../../../abis/SponsoredProposalEvent.json'),
  topics: [SPONSORED_PROPOSAL_EVENT_SIGNATURE_HASH],
};
