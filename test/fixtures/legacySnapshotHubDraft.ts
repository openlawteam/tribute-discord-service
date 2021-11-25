import {
  SnapshotHubLegacyTributeDraftEntry,
  SnapshotHubMessageType,
} from '../../src/services/snapshotHub';
import {BYTES32_FIXTURE} from './constants';
import {ETH_ADDRESS_FIXTURE} from '.';

export const LEGACY_TRIBUTE_SNAPSHOT_HUB_DRAFT_FIXTURE: SnapshotHubLegacyTributeDraftEntry =
  {
    [BYTES32_FIXTURE]: {
      actionId: ETH_ADDRESS_FIXTURE,
      data: {sponsored: false},
      msg: {
        payload: {
          body: 'Wow, what a cool submission!',
          name: 'Test Proposal',
        },
        timestamp: (new Date(0).getTime() / 1000).toFixed(),
        type: SnapshotHubMessageType.DRAFT,
      },
    },
  };
