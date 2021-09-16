import {
  EMPTY_BYTES32_FIXTURE,
  LEGACY_TRIBUTE_SNAPSHOT_HUB_PROPOSAL_FIXTURE,
} from '../../../test';
import {legacyTributeProposalResolver} from './legacyTributeProposalResolver';
import {rest, server} from '../../../test/msw/server';

describe('legacyTributeProposalResolver unit tests', () => {
  test('should return a legacy Tribute snapshot hub proposal', async () => {
    expect(
      await legacyTributeProposalResolver({
        // @see `docker-host` in `docker-compose.dev.yml`
        apiBaseURL: 'http://docker-host:8081/api',
        proposalID: EMPTY_BYTES32_FIXTURE,
        space: 'tribute',
      })
    ).toEqual({
      body: LEGACY_TRIBUTE_SNAPSHOT_HUB_PROPOSAL_FIXTURE.body.msg.payload.body,
      id: LEGACY_TRIBUTE_SNAPSHOT_HUB_PROPOSAL_FIXTURE.body.data
        .erc712DraftHash,
      title: LEGACY_TRIBUTE_SNAPSHOT_HUB_PROPOSAL_FIXTURE.body.msg.payload.name,
    });
  });

  test('should not throw when error; returns `undefined`', async () => {
    server.use(
      rest.get('http://*/api/*/proposal/*', (_req, res, ctx) =>
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
      await legacyTributeProposalResolver({
        // @see `docker-host` in `docker-compose.dev.yml`
        apiBaseURL: 'http://docker-host:8081/api',
        proposalID: EMPTY_BYTES32_FIXTURE,
        space: 'tribute',
      })
    ).toBe(undefined);

    expect(errorHandlerSpy.mock.calls.length).toBe(1);
  });
});
