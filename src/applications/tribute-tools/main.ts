import {Client, Intents} from 'discord.js';

import {
  sweepEndedPollsHandler,
  sweepPollReactionHandler,
} from './handlers/sweep';
import {ApplicationReturn} from '../types';
import {buyPollReactionHandler, interactionExecuteHandler} from './handlers';
import {deployCommands, destroyClientHandler, getCommands} from '../helpers';
import {getEnv} from '../../helpers';
import {TRIBUTE_TOOLS_BOT_ID} from '../../config';

export async function tributeToolsBot(): Promise<
  ApplicationReturn | undefined
> {
  try {
    if (!getEnv('BOT_TOKEN_TRIBUTE_TOOLS')) {
      return;
    }

    const commands = await getCommands(async () => await import('./commands'));

    // Deploy commands
    try {
      await deployCommands({
        applicationID: TRIBUTE_TOOLS_BOT_ID,
        commands,
        name: 'TRIBUTE_TOOLS_BOT',
        tokenEnvVarName: 'BOT_TOKEN_TRIBUTE_TOOLS',
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
    client.login(getEnv('BOT_TOKEN_TRIBUTE_TOOLS'));

    // When the Discord client is ready, run this code (only once)
    client.once('ready', (): void => {
      console.log('🤖  Tribute Tools bot ready');

      // Poll every x seconds to check for ended polls and process them
      sweepEndedPollsHandler({client});
    });

    // Listen for interactions and possibly run commands
    client.on('interactionCreate', (interaction) => {
      interactionExecuteHandler({commands, interaction});
    });

    // Listen to reactions on messages and possibly handle
    client.on('messageReactionAdd', (reaction, user) => {
      buyPollReactionHandler({reaction, user});
      sweepPollReactionHandler({reaction, user});
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
