import {EMPTY_BYTES32_FIXTURE} from './constants';

export const LEGACY_TRIBUTE_SNAPSHOT_HUB_PROPOSAL_FIXTURE = {
  body: {
    data: {erc712DraftHash: EMPTY_BYTES32_FIXTURE},
    msg: {
      payload: {
        name: 'Test Proposal',
        body: 'Wow, what a cool submission!',
      },
    },
  },
};
