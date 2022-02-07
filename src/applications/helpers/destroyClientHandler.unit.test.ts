import {Client, Intents} from 'discord.js';

import {destroyClientHandler} from '.';

describe('destroyClientHandler unit tests', () => {
  test('should destroy Discord `Client`', async () => {
    const consoleLogSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {});

    const client = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      ],
      partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
      restSweepInterval: 0,
    });

    const destroySpy = jest.spyOn(client, 'destroy');

    expect(await destroyClientHandler(client, 'TRIBUTE_TOOLS_BOT')).toBe(
      undefined
    );

    expect(destroySpy.mock.calls.length).toBe(1);

    expect(consoleLogSpy.mock.calls[0][0]).toMatch(
      /Successfully destroyed TRIBUTE_TOOLS_BOT client instance\./i
    );

    // Cleanup

    consoleLogSpy.mockRestore();
    destroySpy.mockRestore();
  });

  test('should throw', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    try {
      await destroyClientHandler({} as any, 'TRIBUTE_TOOLS_BOT');
    } catch (error) {
      expect(consoleErrorSpy.mock.calls.length).toBe(1);
      expect(consoleErrorSpy.mock.calls[0][0]).toMatch(
        /Error while destroying TRIBUTE_TOOLS_BOT client instance: "client\.destroy is not a function/i
      );
    }

    // Cleanup
    consoleErrorSpy.mockRestore();
  });
});
