import {
  BYTES32_FIXTURE,
  LEGACY_TRIBUTE_SNAPSHOT_HUB_PROPOSAL_FIXTURE,
} from '../../../test';
import {legacyTributeProposalResolver} from './legacyTributeProposalResolver';
import {rest, server} from '../../../test/msw/server';

describe('legacyTributeProposalResolver unit tests', () => {
  const proposalData = Object.entries(
    LEGACY_TRIBUTE_SNAPSHOT_HUB_PROPOSAL_FIXTURE
  )[0][1];

  test('should return a legacy Tribute snapshot hub proposal', async () => {
    expect(
      await legacyTributeProposalResolver({
        // @see `docker-host` in `docker-compose.dev.yml`
        apiBaseURL: 'http://docker-host:8081/api',
        proposalID: BYTES32_FIXTURE,
        space: 'tribute',
      })
    ).toEqual({
      body: proposalData.msg.payload.body,
      id: proposalData.data.erc712DraftHash,
      raw: proposalData,
      title: proposalData.msg.payload.name,
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
        proposalID: BYTES32_FIXTURE,
        space: 'tribute',
      })
    ).toBe(undefined);

    expect(errorHandlerSpy.mock.calls.length).toBe(1);
  });
});
