import {DiscordWebhook} from '@prisma/client';

import {getWebhookByWebhookID} from './getWebhook';
import {prismaMock} from '../../../test/singleton';

describe('getWebhook unit tests', () => {
  test('should get a webhook by its Discord webhook ID', async () => {
    const webhook: DiscordWebhook = {
      id: 1,
      createdAt: new Date(0),
      webhookID: 'abc123',
      webhookToken: 'def456',
      orgId: 1,
    };

    // Mock result
    prismaMock.discordWebhook.findUnique.mockResolvedValue(webhook);

    expect(await getWebhookByWebhookID('abc123')).toEqual(webhook);
  });

  test('should throw an error if argument is bad', async () => {
    // Mock error
    prismaMock.discordWebhook.findUnique.mockRejectedValue(new Error('Ugh!'));

    try {
      await getWebhookByWebhookID('abc123');
    } catch (error) {
      expect(error?.message).toMatch(/^ugh!$/i);
    }
  });
});
