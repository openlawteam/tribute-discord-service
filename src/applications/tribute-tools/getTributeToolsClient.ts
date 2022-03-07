import {Client, Intents} from 'discord.js';

import {destroyClientHandler} from '../helpers';
import {getEnv} from '../../helpers';

let clientCached: Client | undefined;

function clientStop(client: Client): () => Promise<void> {
  return async () => {
    await destroyClientHandler(client, 'TRIBUTE_TOOLS_BOT');

    // invalidate cache
    clientCached = undefined;
  };
}

export async function getTributeToolsClient(): Promise<{
  client: Client;
  stop: () => Promise<void>;
}> {
  try {
    if (clientCached) {
      return {
        client: clientCached,
        stop: clientStop(clientCached),
      };
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
    await client.login(getEnv('BOT_TOKEN_TRIBUTE_TOOLS'));

    // Set cache
    clientCached = client;

    return {
      client: client,
      stop: clientStop(client),
    };
  } catch (error) {
    console.error(error);

    throw error;
  }
}
