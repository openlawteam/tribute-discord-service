import {getCommands} from '../helpers';
import {getEnv} from '../../helpers';
import {TRIBUTE_TOOLS_BOT_ID} from '../../config';

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
    await returnValue?.stop?.();
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
    await returnValue?.stop?.();
  });

  test('should call `interactionCreate` handlers', async () => {
    const DEFAULT_INTERACTION = {interactionTest: 'test'};

    const discord = await import('discord.js');

    const interactionExecuteHandler = await import(
      './handlers/interactionExecuteHandler'
    );

    const cancelPollHandler = await import('./handlers/cancelPollHandler');

    const confirmCancelPollHandler = await import(
      './handlers/confirmCancelPollHandler'
    );

    const loginSpy = jest
      .spyOn(discord.Client.prototype, 'login')
      .mockImplementation(async () => '');

    const interactionExecuteHandlerSpy = jest
      .spyOn(interactionExecuteHandler, 'interactionExecuteHandler')
      .mockImplementation(() => null as any);

    const cancelPollHandlerSpy = jest
      .spyOn(cancelPollHandler, 'cancelPollHandler')
      .mockImplementation(() => null as any);

    const confirmCancelPollHandlerSpy = jest
      .spyOn(confirmCancelPollHandler, 'confirmCancelPollHandler')
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
      interaction: DEFAULT_INTERACTION,
    });

    expect(cancelPollHandlerSpy).toHaveBeenCalledTimes(1);
    expect(cancelPollHandlerSpy).toHaveBeenCalledWith(DEFAULT_INTERACTION);
    expect(confirmCancelPollHandlerSpy).toHaveBeenCalledTimes(1);

    expect(confirmCancelPollHandlerSpy).toHaveBeenCalledWith(
      DEFAULT_INTERACTION
    );

    // Cleanup

    deployCommandsSpy.mockRestore();
    interactionExecuteHandlerSpy.mockRestore();
    loginSpy.mockRestore();
    await returnValue?.stop?.();
  });

  test('should call `messageReactionAdd` handlers', async () => {
    const discord = await import('discord.js');

    const sweepPollReactionHandler = await import(
      './handlers/sweep/sweepPollReactionHandler'
    );

    const buyPollReactionHandler = await import(
      './handlers/buy/buyPollReactionHandler'
    );
    const fundPollReactionHandler = await import(
      './handlers/fund/fundPollReactionHandler'
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

    const fundPollReactionHandlerSpy = jest
      .spyOn(fundPollReactionHandler, 'fundPollReactionHandler')
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
    fundPollReactionHandlerSpy.mockRestore();
    sweepPollReactionHandlerSpy.mockRestore();
    loginSpy.mockRestore();
    await returnValue?.stop?.();
  });

  test('should call `messageReactionRemove` handlers', async () => {
    const discord = await import('discord.js');

    const buyPollRemoveReactionHandler = await import(
      './handlers/buy/buyPollRemoveReactionHandler'
    );
    const fundPollRemoveReactionHandler = await import(
      './handlers/fund/fundPollRemoveReactionHandler'
    );

    const loginSpy = jest
      .spyOn(discord.Client.prototype, 'login')
      .mockImplementation(async () => '');

    const buyPollRemoveReactionHandlerSpy = jest
      .spyOn(buyPollRemoveReactionHandler, 'buyPollRemoveReactionHandler')
      .mockImplementation(() => null as any);

    const fundPollRemoveReactionHandlerSpy = jest
      .spyOn(fundPollRemoveReactionHandler, 'fundPollRemoveReactionHandler')
      .mockImplementation(() => null as any);

    const {tributeToolsBot} = await import('../tribute-tools/main');

    const deployCommands = await import('../helpers/deployCommands');

    const deployCommandsSpy = jest
      .spyOn(deployCommands, 'deployCommands')
      .mockImplementation(async () => {});

    const returnValue = await tributeToolsBot();

    // Emit `messageReactionAdd` event
    returnValue?.client?.emit(
      'messageReactionRemove' as any,
      {reactionTest: 'test'},
      {userTest: 'test'}
    );

    expect(buyPollRemoveReactionHandlerSpy).toHaveBeenCalledTimes(1);

    expect(buyPollRemoveReactionHandlerSpy).toHaveBeenCalledWith({
      reaction: {reactionTest: 'test'},
      user: {userTest: 'test'},
    });

    // Cleanup

    deployCommandsSpy.mockRestore();
    buyPollRemoveReactionHandlerSpy.mockRestore();
    fundPollRemoveReactionHandlerSpy.mockRestore();
    loginSpy.mockRestore();
    await returnValue?.stop?.();
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
    await returnValue?.stop?.();
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

    const returnValue = await tributeToolsBot();

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
    await returnValue?.stop?.();
  });
});
