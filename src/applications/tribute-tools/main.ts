import {Client, Intents} from 'discord.js';

import {
  endedPollsHandler,
  interactionExecuteHandler,
  pollReactionHandler,
} from './handlers';
import {ApplicationReturn} from '../types';
import {deployCommands, destroyClientHandler, getCommands} from '../helpers';
import {FLOOR_SWEEPER_POLL_BOT_ID} from '../../config';
import {getEnv} from '../../helpers';

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
        applicationID: FLOOR_SWEEPER_POLL_BOT_ID,
        commands,
        name: 'FLOOR_SWEEPER_POLL_BOT',
        tokenEnvVarName: 'BOT_TOKEN_FLOOR_SWEEPER_POLL',
      });
    } catch (error) {
      console.error(
        `Discord commands for FLOOR_SWEEPER_POLL_BOT could not be deployed. ${error}`
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
      await destroyClientHandler(client, 'FLOOR_SWEEPER_POLL_BOT');
    };

    return {
      client,
      name: 'FLOOR_SWEEPER_POLL_BOT',
      stop,
    };
  } catch (error) {
    console.error(error);
  }
}
