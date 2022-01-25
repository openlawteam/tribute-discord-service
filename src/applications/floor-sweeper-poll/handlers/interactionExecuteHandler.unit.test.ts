import {CommandInteraction} from 'discord.js';

import {interactionExecuteHandler} from '.';
import {getCommands} from '../../helpers';

describe('interactionExecuteHandler unit tests', () => {
  const FAKE_INTERACTION = {
    commandName: 'sweep',
    isCommand: () => true,
  } as any as CommandInteraction;

  test('should execute commands', async () => {
    const {sweep} = await import('../../floor-sweeper-poll/commands/sweep');

    const executeSpy = jest
      .spyOn(sweep, 'execute')
      .mockImplementation(async () => undefined);

    const commands = await getCommands(
      async () => await import('../../floor-sweeper-poll/commands')
    );

    await interactionExecuteHandler({
      commands,
      // Use just enough data for the test to run
      interaction: FAKE_INTERACTION,
    });

    expect(executeSpy).toHaveBeenCalledTimes(1);
    expect(executeSpy).toHaveBeenCalledWith(FAKE_INTERACTION);
  });
});
