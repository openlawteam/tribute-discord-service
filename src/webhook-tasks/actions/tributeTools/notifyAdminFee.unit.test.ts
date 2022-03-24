import {MessageEmbed} from 'discord.js';

import {notifyAdminFee} from './notifyAdminFee';

describe('notifyAdminFee unit tests', () => {
  const PAYLOAD = {
    amount: '1000000000000000000',
    daoName: 'tribute',
    description: 'Fee is due to be collected',
  };

  const EMBED = new MessageEmbed()
    .setTitle('💸 Admin Fee Due')
    .setDescription(PAYLOAD.description)
    .addFields([
      {name: 'DAO', value: PAYLOAD.daoName},
      {name: 'Amount', value: `1 ETH`},
    ]);

  test('should send Discord message', async () => {
    const sendSpy = jest.fn();

    const getDiscordWebhookClientSpy = jest
      .spyOn(
        await import('../../../services/discord/getDiscordWebhookClient'),
        'getDiscordWebhookClient'
      )
      .mockImplementation(
        async () =>
          ({
            send: sendSpy,
          } as any)
      );

    await notifyAdminFee(PAYLOAD);

    expect(getDiscordWebhookClientSpy).toHaveBeenCalledTimes(1);

    // Assert `getDiscordWebhookClient` was called with dev channel ID
    expect(getDiscordWebhookClientSpy).toHaveBeenNthCalledWith(
      1,
      '886976872611729439'
    );

    expect(sendSpy).toHaveBeenCalledTimes(1);

    // Assert message was sent
    expect(sendSpy).toHaveBeenNthCalledWith(1, {
      embeds: [EMBED],
      username: 'Tribute Tools [dev]',
    });

    // Cleanup
    getDiscordWebhookClientSpy.mockRestore();
  });

  test('should throw an error when message cannot be sent', async () => {
    const ERROR = new Error('Some bad error');

    const sendSpy = jest.fn().mockImplementation(async () => {
      throw ERROR;
    });

    const getDiscordWebhookClientSpy = jest
      .spyOn(
        await import('../../../services/discord/getDiscordWebhookClient'),
        'getDiscordWebhookClient'
      )
      .mockImplementation(
        async () =>
          ({
            send: sendSpy,
          } as any)
      );

    let e: Error | undefined = undefined;

    try {
      await notifyAdminFee(PAYLOAD);
    } catch (error) {
      if (error instanceof Error) {
        e = error;
      }
    }

    expect(getDiscordWebhookClientSpy).toHaveBeenCalledTimes(1);

    // Assert `getDiscordWebhookClient` was called with dev channel ID
    expect(getDiscordWebhookClientSpy).toHaveBeenNthCalledWith(
      1,
      '886976872611729439'
    );

    expect(sendSpy).toHaveBeenCalledTimes(1);

    // Assert message was sent
    expect(sendSpy).toHaveBeenNthCalledWith(1, {
      embeds: [EMBED],
      username: 'Tribute Tools [dev]',
    });

    // Assert call resulted in an error
    expect(e).toEqual(ERROR);

    // Cleanup
    getDiscordWebhookClientSpy.mockRestore();
  });
});
