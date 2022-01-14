import {Client, Intents} from 'discord.js';

import {ApplicationReturn} from '../types';
import {getEnv} from '../../helpers';
import {destroyClientHandler} from '../helpers';

export function floorSweeperPollBot(): ApplicationReturn | void {
  if (!getEnv('BOT_TOKEN_FLOOR_SWEEPER_POLL')) {
    return;
  }

  // Create a new Discord client instance
  const client = new Client({intents: [Intents.FLAGS.GUILDS]});

  // When the Discord client is ready, run this code (only once)
  client.once('ready', () => {
    console.log('Floor sweeper bot ready!');
  });

  // Login to Discord with the bot's token
  client.login(getEnv('BOT_TOKEN_FLOOR_SWEEPER_POLL'));

  const stop = async () => {
    await destroyClientHandler(client, 'FLOOR_SWEEPER_POLL_BOT');
  };

  return {
    name: 'FLOOR_SWEEPER_POLL_BOT',
    stop,
  };
}
