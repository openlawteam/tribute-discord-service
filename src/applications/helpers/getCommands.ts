import {Collection} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';

import {Command, GetCommandsReturn} from '../types';

export async function getCommands(
  lazyImport: () => Promise<Record<string, Command>>
): Promise<GetCommandsReturn> {
  const commandsCollection = new Collection<string, Command>();
  const commandsData: SlashCommandBuilder[] = [];

  const commandsLazy = await lazyImport();

  Object.entries(commandsLazy).map(([_filename, value]) => {
    // Set entries on `Collection`
    commandsCollection.set(value.data.name, value);

    // Build list of data for ease of access in `deployCommands`
    commandsData.push(value.data);
  });

  return {commandsCollection, commandsData};
}
