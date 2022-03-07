import {Client} from 'discord.js';

import {getTributeToolsClient} from '.';

describe('getTributeToolsClient unit tests', () => {
  test('should return Discord `Client`', async () => {
    const discord = await import('discord.js');

    const loginSpy = jest
      .spyOn(discord.Client.prototype, 'login')
      .mockImplementation(async () => '');

    const {client, stop} = await getTributeToolsClient();

    expect(client).toBeInstanceOf(Client);
    expect(stop).toBeInstanceOf(Function);
    expect(loginSpy).toHaveBeenCalledTimes(1);

    // Cleanup

    loginSpy.mockRestore();
    await stop();
  });

  test('should return cached Discord `Client`', async () => {
    const discord = await import('discord.js');

    const loginSpy = jest
      .spyOn(discord.Client.prototype, 'login')
      .mockImplementation(async () => '');

    const {client, stop} = await getTributeToolsClient();

    expect(client).toBeInstanceOf(Client);
    expect(stop).toBeInstanceOf(Function);

    const clientCached = await getTributeToolsClient();

    expect(clientCached.client).toBeInstanceOf(Client);
    expect(clientCached.stop).toBeInstanceOf(Function);

    // Should not have been called twice, as the cached `Client` should have been returned.
    expect(loginSpy).toHaveBeenCalledTimes(1);

    // Cleanup

    loginSpy.mockRestore();
    await stop();
  });

  test('should handle error', async () => {
    const discord = await import('discord.js');

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const loginSpy = jest
      .spyOn(discord.Client.prototype, 'login')
      .mockImplementation(async () => {
        throw new Error('Some bad error');
      });

    try {
      await getTributeToolsClient();
    } catch (error) {
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

      expect(consoleErrorSpy.mock.calls[0][0]?.message).toMatch(
        /some bad error/i
      );
    }

    // Cleanup

    loginSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
