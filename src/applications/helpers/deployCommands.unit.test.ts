import {File, FormData, MockAgent, setGlobalDispatcher} from 'undici';
import {Interceptable, MockInterceptor} from 'undici/types/mock-interceptor';

import {APP_ENV} from '../../config/common';
import {deployCommands, getCommands} from './';
import {rest, server} from '../../../test/msw/server';
import {TRIBUTE_TOOLS_BOT_ID} from '../../config/applications';

const appEnvOriginal = APP_ENV;

/**
 * @discordjs/rest uses the `content-type` header to detect whether to parse
 * the response as JSON or as an ArrayBuffer.
 */
const responseOptions: MockInterceptor.MockResponseOptions = {
  headers: {
    'content-type': 'application/json',
  },
};

describe('deployCommands unit tests', () => {
  let mockAgent: MockAgent;
  let mockPool: Interceptable;

  beforeEach(() => {
    mockAgent = new MockAgent();
    mockAgent.disableNetConnect(); // prevent actual requests to Discord
    setGlobalDispatcher(mockAgent); // enabled the mock client to intercept requests

    mockPool = mockAgent.get('https://discord.com');
  });

  afterEach(async () => {
    await mockAgent.close();
  });

  test('should deploy development commands', async () => {
    let endpointCalled: boolean = false;

    /**
     * Mock request
     *
     * discord.js is using `undici` which is not yet covered by `msw`.
     *
     * @see https://github.com/mswjs/interceptors/issues/159
     */
    mockPool
      .intercept({
        // path: 'https://discord.com/api/v10/applications/*/guilds/*/commands',
        path: /\/api\/v10\/applications\/\d{1,}\/guilds\/\d{1,}\/commands/,
        method: 'PUT',
      })
      .reply(() => {
        endpointCalled = true;

        return {
          data: {},
          statusCode: 200,
          responseOptions,
        };
      });

    const commands = await getCommands(
      async () => await import('../tribute-tools/commands')
    );

    const result = await deployCommands({
      applicationID: TRIBUTE_TOOLS_BOT_ID,
      commands,
      name: 'TRIBUTE_TOOLS_BOT',
      tokenEnvVarName: 'BOT_TOKEN_TRIBUTE_TOOLS',
    });

    expect(result).toBe(undefined);
    expect(endpointCalled).toBe(true);
  });

  test('should deploy production commands', async () => {
    let endpointCalled: boolean = false;

    /**
     * Mock request
     *
     * discord.js is using `undici` which is not yet covered by `msw`.
     *
     * @see https://github.com/mswjs/interceptors/issues/159
     */
    mockPool
      .intercept({
        // path: 'https://discord.com/api/v10/applications/*/guilds/*/commands',
        path: /\/api\/v10\/applications\/\d{1,}\/commands/,
        method: 'PUT',
      })
      .reply(() => {
        endpointCalled = true;

        return {
          data: {},
          statusCode: 200,
          responseOptions,
        };
      });

    // Env var setup
    (APP_ENV as any) = 'production';

    const commands = await getCommands(
      async () => await import('../tribute-tools/commands')
    );

    const result = await deployCommands({
      applicationID: TRIBUTE_TOOLS_BOT_ID,
      commands,
      name: 'TRIBUTE_TOOLS_BOT',
      tokenEnvVarName: 'BOT_TOKEN_TRIBUTE_TOOLS',
    });

    expect(result).toBe(undefined);
    expect(endpointCalled).toBe(true);

    // Cleanup
    (APP_ENV as any) = appEnvOriginal;
  });

  test('should exit if no token', async () => {
    let endpointCalled: boolean = false;

    // Server setup for production global commands
    server.use(
      rest.put(
        'https://discord.com/api/v10/applications/*/commands',
        async (_req, res, ctx) => {
          endpointCalled = true;

          return res(ctx.json(200));
        }
      )
    );

    const commands = await getCommands(
      async () => await import('../tribute-tools/commands')
    );

    const result = await deployCommands({
      applicationID: TRIBUTE_TOOLS_BOT_ID,
      commands,
      name: 'TRIBUTE_TOOLS_BOT',
      tokenEnvVarName: 'BAD_TOKEN_NAME' as any,
    });

    expect(result).toBe(undefined);
    expect(endpointCalled).toBe(false);
  });
});
