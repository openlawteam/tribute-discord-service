import {DiscordWebhook} from '@prisma/client';
import {WebhookClient} from 'discord.js';

import {getDiscordWebookClient} from './getDiscordWebhookClient';
import {prismaMock} from '../../../test/prismaMock';

describe('getDiscordWebookClient unit tests', () => {
  test('should get a Discord `WebhookClient` by its Discord webhook ID', async () => {
    const webhook: DiscordWebhook = {
      id: 1,
      createdAt: new Date(0),
      webhookID: 'abc123',
      webhookToken: 'def456',
      orgId: 1,
    };

    // Mock result
    prismaMock.discordWebhook.findUnique.mockResolvedValue(webhook);

    const client = await getDiscordWebookClient('abc123');

    expect(client).toBeInstanceOf(WebhookClient);
    expect(client.token).toBe(webhook.webhookToken);
  });

  test('should throw an error if no webhook found', async () => {
    const noWebhook: null = null;

    // Mock result
    prismaMock.discordWebhook.findUnique.mockResolvedValue(noWebhook);

    try {
      await getDiscordWebookClient('abc123');
    } catch (error: any) {
      expect(error?.message).toMatch(
        /^could not create a discord `webhookclient`\. no webhook found using `webhookid` abc123\.$/i
      );
    }
  });

  test('should throw an error if query fails', async () => {
    // Mock error
    prismaMock.discordWebhook.findUnique.mockRejectedValue(new Error('Ugh!'));

    try {
      await getDiscordWebookClient('abc123');
    } catch (error: any) {
      expect(error?.message).toMatch(/^ugh!$/i);
    }
  });
});
