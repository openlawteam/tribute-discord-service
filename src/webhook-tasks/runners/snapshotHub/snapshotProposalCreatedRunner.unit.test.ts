import {
  SnapshotHubEventPayload,
  SnapshotHubEvents,
} from '../../actions/snapshotHub/types';
import {getDaoDiscordConfigs} from '../../../services';
import {SNAPSHOT_PROPOSAL_CREATED_EVENT} from '../../events/snapshotHub';
import {snapshotEventEmitter} from '../../../singletons/eventEmitters';
import {snapshotProposalCreatedRunner} from './snapshotProposalCreatedRunner';

describe('snapshotProposalCreatedRunner unit tests', () => {
  const DEFAULT_PAYLOAD: SnapshotHubEventPayload = {
    event: SnapshotHubEvents.PROPOSAL_CREATED,
    expire: Math.floor(Date.now()),
    id: 'proposal/abc123',
    space: 'test',
  };

  test('should execute runner lifeycle', async () => {
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

    const daos = await getDaoDiscordConfigs();

    // Start runner
    const runner = await snapshotProposalCreatedRunner(daos);

    // Emit `proposalCreated` event
    snapshotEventEmitter.emit('proposalCreated', DEFAULT_PAYLOAD);

    // Assert `legacyTributeGovernanceProposalCreated` called
    expect(legacyTributeGovernanceProposalCreatedSpy.mock.calls.length).toBe(1);

    expect(legacyTributeGovernanceProposalCreatedSpy.mock.calls[0][0]).toEqual(
      SNAPSHOT_PROPOSAL_CREATED_EVENT
    );

    expect(legacyTributeGovernanceProposalCreatedSpy.mock.calls[0][1]).toEqual(
      daos
    );

    // Assert `legacyTributeDraftCreated` called
    expect(legacyTributeDraftCreatedSpy.mock.calls.length).toBe(1);

    expect(legacyTributeDraftCreatedSpy.mock.calls[0][0]).toEqual(
      SNAPSHOT_PROPOSAL_CREATED_EVENT
    );

    expect(legacyTributeDraftCreatedSpy.mock.calls[0][1]).toEqual(daos);

    // Spy on `console.log`
    const consoleLogSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {});

    // Stop runner
    await runner.stop?.();

    // Assert `adminFee` listener was removed and only the default `error` listener is registered
    expect(snapshotEventEmitter.eventNames()).toEqual(['error']);

    // Assert information logged
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);

    expect(consoleLogSpy).toHaveBeenNthCalledWith(
      1,
      'Removed `proposalCreated` event listener: `runAllEach`.'
    );

    // Cleanup

    legacyTributeGovernanceProposalCreatedSpy.mockRestore();
    legacyTributeDraftCreatedSpy.mockRestore();
  });
});
