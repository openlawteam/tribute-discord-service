import {getDaos} from '../../../services';
import {SNAPSHOT_PROPOSAL_CREATED_EVENT} from '../../events/snapshotHub';
import {SnapshotHubEvents} from '../../actions/snapshotHub/types';
import {snapshotProposalEventRunner} from './proposalEventRunner';

describe('proposalEventRunner unit tests', () => {
  test('should call actions for `SnapshotHubEvents.PROPOSAL_CREATED`', async () => {
    const legacyTributeGovernanceProposalCreatedWebhook = await import(
      '../../actions/snapshotHub/legacyTributeGovernanceProposalCreated'
    );

    const actionSpy = jest
      .spyOn(
        legacyTributeGovernanceProposalCreatedWebhook,
        'legacyTributeGovernanceProposalCreatedAction'
      )
      .mockImplementation(() => async () => undefined);

    await snapshotProposalEventRunner({
      event: SnapshotHubEvents.PROPOSAL_CREATED,
      expire: Math.floor(new Date(0).getTime() / 1000),
      id: `proposal/`,
      space: 'test',
    });

    expect(actionSpy.mock.calls.length).toBe(1);
    expect(actionSpy.mock.calls[0][0]).toEqual(SNAPSHOT_PROPOSAL_CREATED_EVENT);
    expect(actionSpy.mock.calls[0][1]).toEqual(await getDaos());

    // Cleanup

    actionSpy.mockRestore();
  });

  test('should not call actions if none found', async () => {
    const legacyTributeGovernanceProposalCreatedWebhook = await import(
      '../../actions/snapshotHub/legacyTributeGovernanceProposalCreated'
    );

    const actionSpy = jest
      .spyOn(
        legacyTributeGovernanceProposalCreatedWebhook,
        'legacyTributeGovernanceProposalCreatedAction'
      )
      .mockImplementation(() => async () => undefined);

    await snapshotProposalEventRunner({
      event: 'badEvent' as any,
      expire: Math.floor(new Date(0).getTime() / 1000),
      id: `proposal/`,
      space: 'test',
    });

    expect(actionSpy.mock.calls.length).toBe(0);

    // Cleanup

    actionSpy.mockRestore();
  });
});
