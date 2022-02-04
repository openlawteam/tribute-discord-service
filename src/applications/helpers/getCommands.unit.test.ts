import {Collection} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';

import {getCommands} from './';

describe('getCommands unit tests', () => {
  test('should return commands', async () => {
    const {commandsCollection, commandsData} = await getCommands(
      async () => await import('../tribute-tools/commands')
    );

    expect(commandsCollection).toBeInstanceOf(Collection);
    expect(commandsData[0]).toBeInstanceOf(SlashCommandBuilder);
  });
});
