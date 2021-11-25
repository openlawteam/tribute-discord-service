import {BYTES32_FIXTURE} from '../../../test/fixtures';
import {snapshotHubResolverSelector} from './snapshotHubResolverSelector';

describe('snapshotHubResolverSelector unit tests', () => {
  test('should call `legacyTributeProposalResolver` resolver', async () => {
    const legacyTributeProposalResolver = await import(
      '../snapshotHub/legacyTributeProposalResolver'
    );

    const legacyTributeProposalResolverMock = jest
      .spyOn(legacyTributeProposalResolver, 'legacyTributeProposalResolver')
      .mockImplementation(async () => undefined);

    snapshotHubResolverSelector({
      proposalID: BYTES32_FIXTURE,
      space: 'test',
      resolver: 'LEGACY_TRIBUTE',
    });

    // Assert `legacyTributeProposalResolver` called
    expect(legacyTributeProposalResolverMock.mock.calls.length).toBe(1);

    expect(legacyTributeProposalResolverMock.mock.calls[0][0]).toEqual({
      proposalID: BYTES32_FIXTURE,
      resolver: 'LEGACY_TRIBUTE',
      space: 'test',
    });

    legacyTributeProposalResolverMock.mockRestore();
  });

  test('should call `legacyTributeDraftResolver` resolver', async () => {
    const legacyTributeDraftResolver = await import(
      '../snapshotHub/legacyTributeDraftResolver'
    );

    const legacyTributeDraftResolverMock = jest
      .spyOn(legacyTributeDraftResolver, 'legacyTributeDraftResolver')
      .mockImplementation(async () => undefined);

    snapshotHubResolverSelector({
      proposalID: BYTES32_FIXTURE,
      space: 'test',
      resolver: 'LEGACY_TRIBUTE_DRAFT',
    });

    // Assert `legacyTributeProposalResolver` called
    expect(legacyTributeDraftResolverMock.mock.calls.length).toBe(1);

    expect(legacyTributeDraftResolverMock.mock.calls[0][0]).toEqual({
      proposalID: BYTES32_FIXTURE,
      resolver: 'LEGACY_TRIBUTE_DRAFT',
      space: 'test',
    });

    legacyTributeDraftResolverMock.mockRestore();
  });

  test('should call default resolver', async () => {
    const legacyTributeProposalResolver = await import(
      '../snapshotHub/legacyTributeProposalResolver'
    );

    const legacyTributeProposalResolverMock = jest
      .spyOn(legacyTributeProposalResolver, 'legacyTributeProposalResolver')
      .mockImplementation(async () => undefined);

    snapshotHubResolverSelector({
      proposalID: BYTES32_FIXTURE,
      space: 'test',
    });

    // Assert `legacyTributeProposalResolver` called
    expect(legacyTributeProposalResolverMock.mock.calls.length).toBe(1);

    expect(legacyTributeProposalResolverMock.mock.calls[0][0]).toEqual({
      proposalID: BYTES32_FIXTURE,
      space: 'test',
    });

    legacyTributeProposalResolverMock.mockRestore();
  });
});
