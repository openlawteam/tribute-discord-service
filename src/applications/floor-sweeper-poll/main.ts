import {Client, Intents} from 'discord.js';

import {ApplicationReturn} from '../types';
import {deployCommands, destroyClientHandler, getCommands} from '../helpers/';
import {FLOOR_SWEEPER_POLL_BOT_ID} from '../../config';
import {getEnv} from '../../helpers';

export async function floorSweeperPollBot(): Promise<ApplicationReturn | void> {
  try {
    if (!getEnv('BOT_TOKEN_FLOOR_SWEEPER_POLL')) {
      return;
    }

    const commands = await getCommands(async () => await import('./commands'));

    // Deploy commands
    deployCommands({
      applicationID: FLOOR_SWEEPER_POLL_BOT_ID,
      commands,
      name: 'FLOOR_SWEEPER_POLL_BOT',
      tokenEnvVarName: 'BOT_TOKEN_FLOOR_SWEEPER_POLL',
    });

    // Create a new Discord client instance
    const client = new Client({intents: [Intents.FLAGS.GUILDS]});

    // When the Discord client is ready, run this code (only once)
    client.once('ready', () => {
      console.log('Floor sweeper bot ready!');
    });

    // Login to Discord with the bot's token
    client.login(getEnv('BOT_TOKEN_FLOOR_SWEEPER_POLL'));

    client.on('interactionCreate', async (interaction) => {
      if (!interaction.isCommand()) return;

      const command = commands.commandsCollection.get(interaction.commandName);

      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);

        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    });

    const stop = async () => {
      await destroyClientHandler(client, 'FLOOR_SWEEPER_POLL_BOT');
    };

    return {
      name: 'FLOOR_SWEEPER_POLL_BOT',
      stop,
    };
  } catch (error) {
    console.error(error);
  }
}
