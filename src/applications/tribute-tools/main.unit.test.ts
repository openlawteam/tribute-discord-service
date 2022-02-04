import {FLOOR_SWEEPER_POLL_BOT_ID} from '../../config';
import {getCommands} from '../helpers';
import {getEnv} from '../../helpers';

describe('floor-sweeper-poll/main unit tests', () => {
  test('should log in to bot and return data', async () => {
    const discord = await import('discord.js');

    const loginSpy = jest
      .spyOn(discord.Client.prototype, 'login')
      .mockImplementation(async () => '');

    const {floorSweeperPollBot} = await import('../floor-sweeper-poll/main');

    const deployCommands = await import('../helpers/deployCommands');

    const deployCommandsSpy = jest
      .spyOn(deployCommands, 'deployCommands')
      .mockImplementation(async () => {});

    const returnValue = await floorSweeperPollBot();

    expect(loginSpy).toHaveBeenCalledTimes(1);

    expect(loginSpy).toHaveBeenCalledWith(
      getEnv('BOT_TOKEN_FLOOR_SWEEPER_POLL')
    );

    expect(deployCommandsSpy).toHaveBeenCalledTimes(1);

    expect(deployCommandsSpy).toHaveBeenCalledWith({
      applicationID: FLOOR_SWEEPER_POLL_BOT_ID,
      commands: await getCommands(async () => await import('./commands')),
      name: 'TRIBUTE_TOOLS_BOT',
      tokenEnvVarName: 'BOT_TOKEN_FLOOR_SWEEPER_POLL',
    });

    expect(returnValue?.name).toBe('TRIBUTE_TOOLS_BOT');
    expect(returnValue?.stop).toBeInstanceOf(Function);

    // Cleanup

    loginSpy.mockRestore();
    deployCommandsSpy.mockRestore();
  });

  test('should call `ready` handlers', async () => {
    const discord = await import('discord.js');
    const endedPollsHandler = await import('./handlers/endedPollsHandler');

    const loginSpy = jest
      .spyOn(discord.Client.prototype, 'login')
      .mockImplementation(async () => '');

    const endedPollsHandlerSpy = jest
      .spyOn(endedPollsHandler, 'endedPollsHandler')
      .mockImplementation(() => null as any);

    const {floorSweeperPollBot} = await import('../floor-sweeper-poll/main');

    const deployCommands = await import('../helpers/deployCommands');

    const deployCommandsSpy = jest
      .spyOn(deployCommands, 'deployCommands')
      .mockImplementation(async () => {});

    const returnValue = await floorSweeperPollBot();

    // Emit `ready` event
    returnValue?.client?.emit('ready', returnValue?.client);

    expect(endedPollsHandlerSpy).toHaveBeenCalledTimes(1);

    expect(endedPollsHandlerSpy).toHaveBeenCalledWith({
      client: returnValue?.client,
    });

    // Cleanup

    deployCommandsSpy.mockRestore();
    endedPollsHandlerSpy.mockRestore();
    loginSpy.mockRestore();
  });

  test('should call `interactionCreate` handlers', async () => {
    const discord = await import('discord.js');

    const interactionExecuteHandler = await import(
      './handlers/interactionExecuteHandler'
    );

    const loginSpy = jest
      .spyOn(discord.Client.prototype, 'login')
      .mockImplementation(async () => '');

    const interactionExecuteHandlerSpy = jest
      .spyOn(interactionExecuteHandler, 'interactionExecuteHandler')
      .mockImplementation(() => null as any);

    const {floorSweeperPollBot} = await import('../floor-sweeper-poll/main');

    const deployCommands = await import('../helpers/deployCommands');

    const deployCommandsSpy = jest
      .spyOn(deployCommands, 'deployCommands')
      .mockImplementation(async () => {});

    const returnValue = await floorSweeperPollBot();

    // Emit `interactionCreate` event
    returnValue?.client?.emit('interactionCreate', {
      interactionTest: 'test',
    } as any);

    expect(interactionExecuteHandlerSpy).toHaveBeenCalledTimes(1);

    expect(interactionExecuteHandlerSpy).toHaveBeenCalledWith({
      commands: await getCommands(async () => await import('./commands')),
      interaction: {interactionTest: 'test'},
    });

    // Cleanup

    deployCommandsSpy.mockRestore();
    interactionExecuteHandlerSpy.mockRestore();
    loginSpy.mockRestore();
  });

  test('should call `messageReactionAdd` handlers', async () => {
    const discord = await import('discord.js');

    const pollReactionHandler = await import('./handlers/pollReactionHandler');

    const loginSpy = jest
      .spyOn(discord.Client.prototype, 'login')
      .mockImplementation(async () => '');

    const pollReactionHandlerSpy = jest
      .spyOn(pollReactionHandler, 'pollReactionHandler')
      .mockImplementation(() => null as any);

    const {floorSweeperPollBot} = await import('../floor-sweeper-poll/main');

    const deployCommands = await import('../helpers/deployCommands');

    const deployCommandsSpy = jest
      .spyOn(deployCommands, 'deployCommands')
      .mockImplementation(async () => {});

    const returnValue = await floorSweeperPollBot();

    // Emit `messageReactionAdd` event
    returnValue?.client?.emit(
      'messageReactionAdd' as any,
      {reactionTest: 'test'},
      {userTest: 'test'}
    );

    expect(pollReactionHandlerSpy).toHaveBeenCalledTimes(1);

    expect(pollReactionHandlerSpy).toHaveBeenCalledWith({
      reaction: {reactionTest: 'test'},
      user: {userTest: 'test'},
    });

    // Cleanup

    deployCommandsSpy.mockRestore();
    pollReactionHandlerSpy.mockRestore();
    loginSpy.mockRestore();
  });

  test('should destroy `Client` on `stop()`', async () => {
    const discord = await import('discord.js');

    const destroyClientHandler = await import(
      '../helpers/destroyClientHandler'
    );

    const destroyClientHandlerSpy = jest
      .spyOn(destroyClientHandler, 'destroyClientHandler')
      .mockImplementation(async () => {});

    const loginSpy = jest
      .spyOn(discord.Client.prototype, 'login')
      .mockImplementation(async () => '');

    const {floorSweeperPollBot} = await import('../floor-sweeper-poll/main');

    const deployCommands = await import('../helpers/deployCommands');

    const deployCommandsSpy = jest
      .spyOn(deployCommands, 'deployCommands')
      .mockImplementation(async () => {});

    const returnValue = await floorSweeperPollBot();

    await returnValue?.stop?.();

    expect(destroyClientHandlerSpy).toHaveBeenCalledTimes(1);

    // Cleanup

    deployCommandsSpy.mockRestore();
    destroyClientHandlerSpy.mockRestore();
    loginSpy.mockRestore();
  });

  test('should handle `deployCommands` error', async () => {
    const discord = await import('discord.js');

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => '');

    const loginSpy = jest
      .spyOn(discord.Client.prototype, 'login')
      .mockImplementation(async () => '');

    const {floorSweeperPollBot} = await import('../floor-sweeper-poll/main');

    const deployCommands = await import('../helpers/deployCommands');

    const deployCommandsSpy = jest
      .spyOn(deployCommands, 'deployCommands')
      .mockImplementation(async () => {
        throw new Error('Some bad error.');
      });

    await floorSweeperPollBot();

    expect(loginSpy).toHaveBeenCalledTimes(0);

    expect(deployCommandsSpy).toHaveBeenCalledTimes(1);

    expect(deployCommandsSpy).toHaveBeenCalledWith({
      applicationID: FLOOR_SWEEPER_POLL_BOT_ID,
      commands: await getCommands(async () => await import('./commands')),
      name: 'TRIBUTE_TOOLS_BOT',
      tokenEnvVarName: 'BOT_TOKEN_FLOOR_SWEEPER_POLL',
    });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    expect(consoleErrorSpy.mock.calls[0][0]).toMatch(
      /Discord commands for TRIBUTE_TOOLS_BOT could not be deployed\. Error: Some bad error\./i
    );

    // Cleanup

    consoleErrorSpy.mockRestore();
    deployCommandsSpy.mockRestore();
    loginSpy.mockRestore();
  });
});
