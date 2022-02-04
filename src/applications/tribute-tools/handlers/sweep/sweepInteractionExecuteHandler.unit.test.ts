import {CommandInteraction} from 'discord.js';

import {sweepInteractionExecuteHandler} from '.';
import {getCommands} from '../../../helpers';

describe('sweepInteractionExecuteHandler unit tests', () => {
  const FAKE_INTERACTION = {
    commandName: 'sweep',
    isCommand: () => true,
  } as any as CommandInteraction;

  test('should execute commands', async () => {
    const {sweep} = await import('../../commands/sweep');

    const executeSpy = jest
      .spyOn(sweep, 'execute')
      .mockImplementation(async () => undefined);

    const commands = await getCommands(
      async () => await import('../../commands')
    );

    await sweepInteractionExecuteHandler({
      commands,
      // Use just enough data for the test to run
      interaction: FAKE_INTERACTION,
    });

    expect(executeSpy).toHaveBeenCalledTimes(1);
    expect(executeSpy).toHaveBeenCalledWith(FAKE_INTERACTION);

    // Cleanup
    executeSpy.mockRestore();
  });

  test('should catch error', async () => {
    const ERROR = new Error('Some bad error');

    const {sweep} = await import('../../commands/sweep');

    const executeSpy = jest
      .spyOn(sweep, 'execute')
      .mockImplementation(async () => {
        throw ERROR;
      });

    const followUpSpy = jest.fn();

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => '');

    const commands = await getCommands(
      async () => await import('../../commands')
    );

    await sweepInteractionExecuteHandler({
      commands,
      // Use just enough data for the test to run
      interaction: {
        ...FAKE_INTERACTION,
        followUp: followUpSpy,
      } as any as CommandInteraction,
    });

    expect(followUpSpy).toHaveBeenCalledWith({
      content: 'There was an error while executing the command sweep.',
      ephemeral: true,
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(ERROR);

    // Cleanup
    consoleErrorSpy.mockRestore();
    executeSpy.mockRestore();
    followUpSpy.mockRestore();
  });
});