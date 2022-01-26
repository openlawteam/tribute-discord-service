import {Client} from 'discord.js';

import {ApplicationNames} from '../../config';

export async function destroyClientHandler(
  client: Client,
  name: ApplicationNames
): Promise<void> {
  try {
    client.destroy();

    console.log(`Successfully destroyed ${name} client instance.`);
  } catch (error) {
    console.error(
      `Error while destroying ${name} client instance: "${
        (error as Error).message
      }"`
    );
  }
}
