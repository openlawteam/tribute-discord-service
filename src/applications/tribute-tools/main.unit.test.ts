import {TRIBUTE_TOOLS_BOT_ID} from '../../config';
import {getCommands} from '../helpers';
import {getEnv} from '../../helpers';

describe('tribute-tools/main unit tests', () => {
  test('should log in to bot and return data', async () => {
    const discord = await import('discord.js');

    const loginSpy = jest
      .spyOn(discord.Client.prototype, 'login')
      .mockImplementation(async () => '');

    const {tributeToolsBot} = await import('../tribute-tools/main');

    const deployCommands = await import('../helpers/deployCommands');

    const deployCommandsSpy = jest
      .spyOn(deployCommands, 'deployCommands')
      .mockImplementation(async () => {});

    const returnValue = await tributeToolsBot();

    expect(loginSpy).toHaveBeenCalledTimes(1);

    expect(loginSpy).toHaveBeenCalledWith(getEnv('BOT_TOKEN_TRIBUTE_TOOLS'));

    expect(deployCommandsSpy).toHaveBeenCalledTimes(1);

    expect(deployCommandsSpy).toHaveBeenCalledWith({
      applicationID: TRIBUTE_TOOLS_BOT_ID,
      commands: await getCommands(async () => await import('./commands')),
      name: 'TRIBUTE_TOOLS_BOT',
      tokenEnvVarName: 'BOT_TOKEN_TRIBUTE_TOOLS',
    });

    expect(returnValue?.name).toBe('TRIBUTE_TOOLS_BOT');
    expect(returnValue?.stop).toBeInstanceOf(Function);

    // Cleanup

    loginSpy.mockRestore();
    deployCommandsSpy.mockRestore();
  });

  test('should call `ready` handlers', async () => {
    const discord = await import('discord.js');
    const sweepEndedPollsHandler = await import(
      './handlers/sweep/sweepEndedPollsHandler'
    );

    const loginSpy = jest
      .spyOn(discord.Client.prototype, 'login')
      .mockImplementation(async () => '');

    const endedPollsHandlerSpy = jest
      .spyOn(sweepEndedPollsHandler, 'sweepEndedPollsHandler')
      .mockImplementation(() => null as any);

    const {tributeToolsBot} = await import('../tribute-tools/main');

    const deployCommands = await import('../helpers/deployCommands');

    const deployCommandsSpy = jest
      .spyOn(deployCommands, 'deployCommands')
      .mockImplementation(async () => {});

    const returnValue = await tributeToolsBot();

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

    const {tributeToolsBot} = await import('../tribute-tools/main');

    const deployCommands = await import('../helpers/deployCommands');

    const deployCommandsSpy = jest
      .spyOn(deployCommands, 'deployCommands')
      .mockImplementation(async () => {});

    const returnValue = await tributeToolsBot();

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

    const sweepPollReactionHandler = await import(
      './handlers/sweep/sweepPollReactionHandler'
    );

    const buyPollReactionHandler = await import(
      './handlers/buy/buyPollReactionHandler'
    );

    const loginSpy = jest
      .spyOn(discord.Client.prototype, 'login')
      .mockImplementation(async () => '');

    const sweepPollReactionHandlerSpy = jest
      .spyOn(sweepPollReactionHandler, 'sweepPollReactionHandler')
      .mockImplementation(() => null as any);

    const buyPollReactionHandlerSpy = jest
      .spyOn(buyPollReactionHandler, 'buyPollReactionHandler')
      .mockImplementation(() => null as any);

    const {tributeToolsBot} = await import('../tribute-tools/main');

    const deployCommands = await import('../helpers/deployCommands');

    const deployCommandsSpy = jest
      .spyOn(deployCommands, 'deployCommands')
      .mockImplementation(async () => {});

    const returnValue = await tributeToolsBot();

    // Emit `messageReactionAdd` event
    returnValue?.client?.emit(
      'messageReactionAdd' as any,
      {reactionTest: 'test'},
      {userTest: 'test'}
    );

    expect(sweepPollReactionHandlerSpy).toHaveBeenCalledTimes(1);

    expect(sweepPollReactionHandlerSpy).toHaveBeenCalledWith({
      reaction: {reactionTest: 'test'},
      user: {userTest: 'test'},
    });

    expect(buyPollReactionHandlerSpy).toHaveBeenCalledTimes(1);

    expect(buyPollReactionHandlerSpy).toHaveBeenCalledWith({
      reaction: {reactionTest: 'test'},
      user: {userTest: 'test'},
    });

    // Cleanup

    deployCommandsSpy.mockRestore();
    buyPollReactionHandlerSpy.mockRestore();
    sweepPollReactionHandlerSpy.mockRestore();
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

    const {tributeToolsBot} = await import('../tribute-tools/main');

    const deployCommands = await import('../helpers/deployCommands');

    const deployCommandsSpy = jest
      .spyOn(deployCommands, 'deployCommands')
      .mockImplementation(async () => {});

    const returnValue = await tributeToolsBot();

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

    const {tributeToolsBot} = await import('../tribute-tools/main');

    const deployCommands = await import('../helpers/deployCommands');

    const deployCommandsSpy = jest
      .spyOn(deployCommands, 'deployCommands')
      .mockImplementation(async () => {
        throw new Error('Some bad error.');
      });

    await tributeToolsBot();

    expect(loginSpy).toHaveBeenCalledTimes(0);

    expect(deployCommandsSpy).toHaveBeenCalledTimes(1);

    expect(deployCommandsSpy).toHaveBeenCalledWith({
      applicationID: TRIBUTE_TOOLS_BOT_ID,
      commands: await getCommands(async () => await import('./commands')),
      name: 'TRIBUTE_TOOLS_BOT',
      tokenEnvVarName: 'BOT_TOKEN_TRIBUTE_TOOLS',
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
