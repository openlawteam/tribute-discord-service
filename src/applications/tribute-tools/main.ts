import {Client, Intents} from 'discord.js';

import {
  endedPollsHandler,
  interactionExecuteHandler,
  pollReactionHandler,
} from './handlers';
import {ApplicationReturn} from '../types';
import {deployCommands, destroyClientHandler, getCommands} from '../helpers';
import {getEnv} from '../../helpers';
import {TRIBUTE_TOOLS_BOT_ID} from '../../config';

export async function floorSweeperPollBot(): Promise<
  ApplicationReturn | undefined
> {
  try {
    if (!getEnv('BOT_TOKEN_FLOOR_SWEEPER_POLL')) {
      return;
    }

    const commands = await getCommands(async () => await import('./commands'));

    // Deploy commands
    try {
      await deployCommands({
        applicationID: TRIBUTE_TOOLS_BOT_ID,
        commands,
        name: 'TRIBUTE_TOOLS_BOT',
        tokenEnvVarName: 'BOT_TOKEN_FLOOR_SWEEPER_POLL',
      });
    } catch (error) {
      console.error(
        `Discord commands for TRIBUTE_TOOLS_BOT could not be deployed. ${error}`
      );

      return;
    }

    // Create a new Discord client instance
    const client = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      ],
      partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    });

    // Login to Discord with the bot's token
    client.login(getEnv('BOT_TOKEN_FLOOR_SWEEPER_POLL'));

    // When the Discord client is ready, run this code (only once)
    client.once('ready', (): void => {
      console.log('🤖  Floor sweeper bot ready');

      // Poll every x seconds to check for ended polls and process them
      endedPollsHandler({client});
    });

    // Listen for interactions and possibly run commands
    client.on('interactionCreate', async (interaction): Promise<void> => {
      await interactionExecuteHandler({commands, interaction});
    });

    // Listen to reactions on messages and possibly handle
    client.on('messageReactionAdd', async (reaction, user): Promise<void> => {
      pollReactionHandler({reaction, user});
    });

    const stop = async (): Promise<void> => {
      await destroyClientHandler(client, 'TRIBUTE_TOOLS_BOT');
    };

    return {
      client,
      name: 'TRIBUTE_TOOLS_BOT',
      stop,
    };
  } catch (error) {
    console.error(error);
  }
}
