import {
  BYTES32_FIXTURE,
  LEGACY_TRIBUTE_SNAPSHOT_HUB_DRAFT_FIXTURE,
} from '../../../test';
import {legacyTributeDraftResolver} from './legacyTributeDraftResolver';
import {rest, server} from '../../../test/msw/server';
import {SnapshotHubLegacyTributeDraftEntry} from '.';

describe('legacyTributeDraftResolver unit tests', () => {
  const draftData = Object.entries(
    LEGACY_TRIBUTE_SNAPSHOT_HUB_DRAFT_FIXTURE
  )[0][1];

  test('should return a legacy Tribute snapshot hub draft', async () => {
    expect(
      await legacyTributeDraftResolver({
        apiBaseURL: 'http://localhost:8081/api',
        proposalID: BYTES32_FIXTURE,
        space: 'tribute',
      })
    ).toEqual({
      body: draftData.msg.payload.body,
      id: BYTES32_FIXTURE,
      raw: draftData,
      title: draftData.msg.payload.name,
    });
  });

  test('should return `undefined` if response is empty', async () => {
    server.use(
      rest.get<SnapshotHubLegacyTributeDraftEntry>(
        'http://*/api/*/draft/*',
        (_req, res, ctx) => res(ctx.status(404))
      )
    );

    expect(
      await legacyTributeDraftResolver({
        apiBaseURL: 'http://localhost:8081/api',
        proposalID: BYTES32_FIXTURE,
        space: 'tribute',
      })
    ).toBe(undefined);

    server.use(
      rest.get<SnapshotHubLegacyTributeDraftEntry>(
        'http://*/api/*/draft/*',
        (_req, res, ctx) => res(ctx.json({}))
      )
    );

    expect(
      await legacyTributeDraftResolver({
        apiBaseURL: 'http://localhost:8081/api',
        proposalID: BYTES32_FIXTURE,
        space: 'tribute',
      })
    ).toBe(undefined);
  });

  test('should not throw when error; returns `undefined`', async () => {
    server.use(
      rest.get('http://*/api/*/draft/*', (_req, res, ctx) =>
        res(ctx.status(500))
      )
    );

    const getProposalErrorHandler = await import(
      './helpers/getProposalErrorHandler'
    );

    const errorHandlerSpy = jest
      .spyOn(getProposalErrorHandler, 'getProposalErrorHandler')
      // Noop to avoid noisy error logging
      .mockImplementation(() => {});

    expect(
      await legacyTributeDraftResolver({
        apiBaseURL: 'http://localhost:8081/api',
        proposalID: BYTES32_FIXTURE,
        space: 'tribute',
      })
    ).toBe(undefined);

    expect(errorHandlerSpy.mock.calls.length).toBe(1);
  });
});
