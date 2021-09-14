import {WebhookClient} from 'discord.js';

import {getWebhookByWebhookID} from '../db';

export async function getDiscordWebhookClient(
  webhookID: string
): Promise<WebhookClient> {
  const result = await getWebhookByWebhookID(webhookID);

  if (!result) {
    throw new Error(
      `Could not create a Discord \`WebhookClient\`. No webhook data found using \`webhookID\` ${webhookID}.`
    );
  }

  return new WebhookClient({
    id: result.webhookID,
    token: result.webhookToken,
  });
}
