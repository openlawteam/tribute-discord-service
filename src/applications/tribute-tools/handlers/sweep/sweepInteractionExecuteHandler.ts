import {Interaction} from 'discord.js';

import {GetCommandsReturn} from '../../../types';

export async function sweepInteractionExecuteHandler({
  commands,
  interaction,
}: {
  commands: GetCommandsReturn;
  interaction: Interaction;
}): Promise<void> {
  if (!interaction.isCommand()) return;

  const command = commands.commandsCollection.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    try {
      await interaction.reply({
        content: `There was an error while executing the command \`/${interaction.commandName}\`.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
    }
  }
}
