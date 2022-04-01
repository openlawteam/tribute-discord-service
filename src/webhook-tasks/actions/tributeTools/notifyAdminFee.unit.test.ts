import {MessageEmbed} from 'discord.js';

import {DISCORD_CONFIGS_FIXTURE} from '../../../../test/fixtures';
import {notifyAdminFee} from './notifyAdminFee';

describe('notifyAdminFee unit tests', () => {
  const PAYLOAD = {
    amount: '1000000000000000000',
    daoName: 'tribute',
    description: 'Fee is due to be collected',
    totalContribution: '100000000000000000000',
  };

  const EMBED = new MessageEmbed()
    .setTitle('💸 Admin Fee Due')
    .setDescription(PAYLOAD.description)
    .addFields([
      {name: 'DAO', value: PAYLOAD.daoName},
      {name: 'Amount', value: '1 ETH'},
      {name: 'Total Contribution', value: '100 ETH'},
    ]);

  test('should send Discord message', async () => {
    const sendSpy = jest.fn();

    const getDiscordConfigsSpy = jest
      .spyOn(
        await import('../../../services/discordConfig/getDiscordConfigs'),
        'getDiscordConfigs'
      )
      .mockImplementation(async () => DISCORD_CONFIGS_FIXTURE);

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
    expect(getDiscordWebhookClientSpy).toHaveBeenNthCalledWith(1, 'abc123');

    expect(sendSpy).toHaveBeenCalledTimes(1);

    // Assert message was sent
    expect(sendSpy).toHaveBeenNthCalledWith(1, {
      embeds: [EMBED],
      username: 'Tribute Tools [DEV]',
    });

    // Cleanup

    getDiscordConfigsSpy.mockRestore();
    getDiscordWebhookClientSpy.mockRestore();
  });

  test('should handle error when message cannot be sent', async () => {
    const ERROR = new Error('Some bad error');

    const getDiscordConfigsSpy = jest
      .spyOn(
        await import('../../../services/discordConfig/getDiscordConfigs'),
        'getDiscordConfigs'
      )
      .mockImplementation(async () => DISCORD_CONFIGS_FIXTURE);

    const sendSpyError = jest.fn().mockImplementation(async () => {
      throw ERROR;
    });

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const getDiscordWebhookClientSpy = jest
      .spyOn(
        await import('../../../services/discord/getDiscordWebhookClient'),
        'getDiscordWebhookClient'
      )
      .mockImplementation(
        async () =>
          ({
            send: sendSpyError,
          } as any)
      );

    await notifyAdminFee(PAYLOAD);

    expect(getDiscordWebhookClientSpy).toHaveBeenCalledTimes(1);

    // Assert `getDiscordWebhookClient` was called with dev channel ID
    expect(getDiscordWebhookClientSpy).toHaveBeenNthCalledWith(1, 'abc123');

    expect(sendSpyError).toHaveBeenCalledTimes(1);

    // Assert message was sent
    expect(sendSpyError).toHaveBeenNthCalledWith(1, {
      embeds: [EMBED],
      username: 'Tribute Tools [DEV]',
    });

    // Wait for `forEach` loop to complete
    await new Promise((r) => setTimeout(r, 0));

    // Assert error was handled
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    expect(consoleErrorSpy).toHaveBeenNthCalledWith(
      1,
      `Something went wrong while sending admin fee Discord message to \`tribute\`: ${ERROR}`
    );

    // Cleanup

    consoleErrorSpy.mockRestore();
    getDiscordConfigsSpy.mockRestore();
    getDiscordWebhookClientSpy.mockRestore();
  });

  test('should throw error when configs could not be fetched', async () => {
    const ERROR = new Error('Some bad error');

    const getDiscordConfigsSpy = jest
      .spyOn(
        await import('../../../services/discordConfig/getDiscordConfigs'),
        'getDiscordConfigs'
      )
      .mockImplementation(async () => {
        throw ERROR;
      });

    let e: Error | undefined = undefined;

    try {
      await notifyAdminFee(PAYLOAD);
    } catch (error) {
      if (error instanceof Error) {
        e = error;
      }
    }

    expect(getDiscordConfigsSpy).toHaveBeenCalledTimes(1);

    // Wait for `forEach` loop to complete
    await new Promise((r) => setTimeout(r, 0));

    // Assert error was handled
    expect(e).toBe(ERROR);

    // Cleanup

    getDiscordConfigsSpy.mockRestore();
  });
});
