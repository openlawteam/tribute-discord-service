import {EventWeb3Logs} from '../types';
import {getLazyABI} from '../../../helpers';
import {NODE_ENV} from '../../../config';
import {NodeEnv} from '../../../types';
import {RegistryTypes} from '../../types';
import {SPONSORED_PROPOSAL_EVENT_SIGNATURE_HASH} from '../eventSignatures';

const ADDRESS_BY_ENV: Partial<Record<NodeEnv, string[]>> = {
  development: ['0x5f3447B1A5d37a21d797A91D53d223c14e643c82'],
  production: [''],
};

export const SPONSORED_PROPOSAL_WEB3_LOGS: EventWeb3Logs = {
  name: 'Sponsored Proposal',
  type: RegistryTypes.WEB3_LOGS,
  addresses: ADDRESS_BY_ENV[NODE_ENV],
  lazyABI: getLazyABI('../../../abis/SponsoredProposalEvent.json'),
  topics: [SPONSORED_PROPOSAL_EVENT_SIGNATURE_HASH],
};
