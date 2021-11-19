import {BYTES32_FIXTURE} from './constants';
import {ETH_ADDRESS_FIXTURE} from '.';
import {SnapshotHubLegacyTributeProposalEntry} from '../../src/services/snapshotHub';

export const LEGACY_TRIBUTE_SNAPSHOT_HUB_PROPOSAL_FIXTURE: SnapshotHubLegacyTributeProposalEntry =
  {
    [BYTES32_FIXTURE]: {
      actionId: ETH_ADDRESS_FIXTURE,
      data: {erc712DraftHash: BYTES32_FIXTURE},
      msg: {
        payload: {
          body: 'Wow, what a cool submission!',
          end: 1637071441,
          name: 'Test Proposal',
          snapshot: 123,
          start: 1637071321,
        },
      },
    },
  };
