import {Client, Intents} from 'discord.js';

import {destroyClientHandler} from '.';

describe('destroyClientHandler unit tests', () => {
  test('should destroy Discord `Client`', async () => {
    expect(
      await destroyClientHandler(
        new Client({
          intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
          ],
          partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
          restSweepInterval: 0,
        }),
        'FLOOR_SWEEPER_POLL_BOT'
      )
    ).toBe(undefined);
  });

  test('should throw', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    try {
      await destroyClientHandler({} as any, 'FLOOR_SWEEPER_POLL_BOT');
    } catch (error) {
      expect(consoleErrorSpy.mock.calls.length).toBe(1);
      expect(consoleErrorSpy.mock.calls[0][0]).toMatch(
        /Error while destroying FLOOR_SWEEPER_POLL_BOT client instance: "client\.destroy is not a function/i
      );
    }

    // Cleanup
    consoleErrorSpy.mockRestore();
  });
});
