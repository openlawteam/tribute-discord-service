import {getDaoDiscordConfigs} from '../../../services';
import {SNAPSHOT_PROPOSAL_CREATED_EVENT} from '../../events/snapshotHub';
import {SnapshotHubEvents} from '../../actions/snapshotHub/types';
import {snapshotProposalEventRunner} from './proposalEventRunner';

describe('proposalEventRunner unit tests', () => {
  test('should call actions for `SnapshotHubEvents.PROPOSAL_CREATED`', async () => {
    const legacyTributeGovernanceProposalCreated = await import(
      '../../actions/snapshotHub/legacyTributeGovernanceProposalCreated'
    );

    const legacyTributeDraftCreated = await import(
      '../../actions/snapshotHub/legacyTributeDraftCreated'
    );

    const legacyTributeGovernanceProposalCreatedSpy = jest
      .spyOn(
        legacyTributeGovernanceProposalCreated,
        'legacyTributeGovernanceProposalCreatedAction'
      )
      .mockImplementation(() => async () => undefined);

    const legacyTributeDraftCreatedSpy = jest
      .spyOn(legacyTributeDraftCreated, 'legacyTributeDraftCreatedAction')
      .mockImplementation(() => async () => undefined);

    await snapshotProposalEventRunner({
      event: SnapshotHubEvents.PROPOSAL_CREATED,
      expire: Math.floor(new Date(0).getTime() / 1000),
      id: `proposal/`,
      space: 'test',
    });

    // Assert `legacyTributeGovernanceProposalCreated` called
    expect(legacyTributeGovernanceProposalCreatedSpy.mock.calls.length).toBe(1);

    expect(legacyTributeGovernanceProposalCreatedSpy.mock.calls[0][0]).toEqual(
      SNAPSHOT_PROPOSAL_CREATED_EVENT
    );

    expect(legacyTributeGovernanceProposalCreatedSpy.mock.calls[0][1]).toEqual(
      await getDaoDiscordConfigs()
    );

    // Assert `legacyTributeDraftCreated` called
    expect(legacyTributeDraftCreatedSpy.mock.calls.length).toBe(1);

    expect(legacyTributeDraftCreatedSpy.mock.calls[0][0]).toEqual(
      SNAPSHOT_PROPOSAL_CREATED_EVENT
    );

    expect(legacyTributeDraftCreatedSpy.mock.calls[0][1]).toEqual(
      await getDaoDiscordConfigs()
    );

    // Cleanup

    legacyTributeGovernanceProposalCreatedSpy.mockRestore();
    legacyTributeDraftCreatedSpy.mockRestore();
  });

  test('should not call actions if none found', async () => {
    const legacyTributeGovernanceProposalCreated = await import(
      '../../actions/snapshotHub/legacyTributeGovernanceProposalCreated'
    );

    const legacyTributeDraftCreated = await import(
      '../../actions/snapshotHub/legacyTributeDraftCreated'
    );

    const legacyTributeGovernanceProposalCreatedSpy = jest
      .spyOn(
        legacyTributeGovernanceProposalCreated,
        'legacyTributeGovernanceProposalCreatedAction'
      )
      .mockImplementation(() => async () => undefined);

    const legacyTributeDraftCreatedSpy = jest
      .spyOn(legacyTributeDraftCreated, 'legacyTributeDraftCreatedAction')
      .mockImplementation(() => async () => undefined);

    await snapshotProposalEventRunner({
      event: 'badEvent' as any,
      expire: Math.floor(new Date(0).getTime() / 1000),
      id: `proposal/`,
      space: 'test',
    });

    expect(legacyTributeGovernanceProposalCreatedSpy.mock.calls.length).toBe(0);
    expect(legacyTributeDraftCreatedSpy.mock.calls.length).toBe(0);

    // Cleanup

    legacyTributeGovernanceProposalCreatedSpy.mockRestore();
    legacyTributeDraftCreatedSpy.mockRestore();
  });
});
