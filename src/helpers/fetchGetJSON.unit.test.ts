import {fetchGetJSON} from './fetchGetJSON';
import {rest, server} from '../../test/msw/server';

type TestResponseType = {
  animal: string;
  canTalk: boolean;
};

describe('fetchGetJSON unit tests', () => {
  const URL: string = 'https://animals-animals-everywhere.vip';

  test('should return JSON from an HTTP GET request', async () => {
    const response: TestResponseType = {
      animal: 'african grey parrot',
      canTalk: true,
    };

    // Mock HTTP GET
    server.use(
      rest.get(URL, async (_req, res, ctx) => res(ctx.json(response)))
    );

    expect(await fetchGetJSON<TestResponseType>(URL)).toEqual<TestResponseType>(
      response
    );
  });

  test('should return `undefined` when status is `404`', async () => {
    // Mock HTTP error
    server.use(rest.get(URL, async (_req, res, ctx) => res(ctx.status(404))));

    expect(await fetchGetJSON<TestResponseType>(URL)).toBe(undefined);
  });

  test('should throw an error from an HTTP GET request', async () => {
    // Mock HTTP error
    server.use(rest.get(URL, async (_req, res, ctx) => res(ctx.status(500))));

    try {
      await fetchGetJSON<TestResponseType>(URL);
    } catch (error) {
      expect((error as Error).message).toMatch(
        /something went wrong while getting json from https:\/\/animals-animals-everywhere\.vip\. error: internal server error/i
      );
    }

    server.resetHandlers();

    // Mock HTTP error with JSON
    server.use(
      rest.get(URL, async (_req, res, ctx) =>
        res(ctx.status(500), ctx.json({message: 'Some bad error'}))
      )
    );

    try {
      await fetchGetJSON<TestResponseType>(URL);
    } catch (error) {
      expect((error as Error).message).toMatch(
        /something went wrong while getting json from https:\/\/animals-animals-everywhere\.vip\. error:/i
      );

      expect((error as Error).message).toContain(
        '{\n  "message": "Some bad error"\n}'
      );
    }
  });
});
