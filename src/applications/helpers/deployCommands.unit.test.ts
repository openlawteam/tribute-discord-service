import {deployCommands, getCommands} from './';

import {APP_ENV} from '../../config/common';
import {rest, server} from '../../../test/msw/server';
import {FLOOR_SWEEPER_POLL_BOT_ID} from '../../config/applications';

const appEnvOriginal = APP_ENV;

describe('deployCommands unit tests', () => {
  test('should deploy development commands', async () => {
    let endpointCalled: boolean = false;

    // Server setup for development guild commands
    server.use(
      rest.put(
        'https://discord.com/api/v9/applications/*/guilds/*/commands',
        async (_req, res, ctx) => {
          endpointCalled = true;

          return res(ctx.json(200));
        }
      )
    );

    const commands = await getCommands(
      async () => await import('../floor-sweeper-poll/commands')
    );

    const result = await deployCommands({
      applicationID: FLOOR_SWEEPER_POLL_BOT_ID,
      commands,
      name: 'FLOOR_SWEEPER_POLL_BOT',
      tokenEnvVarName: 'BOT_TOKEN_FLOOR_SWEEPER_POLL',
    });

    expect(result).toBe(undefined);
    expect(endpointCalled).toBe(true);
  });

  test('should deploy production commands', async () => {
    let endpointCalled: boolean = false;

    // Env var setup
    (APP_ENV as any) = 'production';

    // Server setup for production global commands
    server.use(
      rest.put(
        'https://discord.com/api/v9/applications/*/commands',
        async (_req, res, ctx) => {
          endpointCalled = true;

          return res(ctx.json(200));
        }
      )
    );

    const commands = await getCommands(
      async () => await import('../floor-sweeper-poll/commands')
    );

    const result = await deployCommands({
      applicationID: FLOOR_SWEEPER_POLL_BOT_ID,
      commands,
      name: 'FLOOR_SWEEPER_POLL_BOT',
      tokenEnvVarName: 'BOT_TOKEN_FLOOR_SWEEPER_POLL',
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
        'https://discord.com/api/v9/applications/*/commands',
        async (_req, res, ctx) => {
          endpointCalled = true;

          return res(ctx.json(200));
        }
      )
    );

    const commands = await getCommands(
      async () => await import('../floor-sweeper-poll/commands')
    );

    const result = await deployCommands({
      applicationID: FLOOR_SWEEPER_POLL_BOT_ID,
      commands,
      name: 'FLOOR_SWEEPER_POLL_BOT',
      tokenEnvVarName: 'BAD_TOKEN_NAME' as any,
    });

    expect(result).toBe(undefined);
    expect(endpointCalled).toBe(false);
  });
});
