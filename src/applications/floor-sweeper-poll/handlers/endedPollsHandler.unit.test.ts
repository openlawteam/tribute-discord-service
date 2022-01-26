import {
  Client,
  Intents,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from 'discord.js';

import {
  ETH_ADDRESS_FIXTURE,
  FAKE_DAOS_FIXTURE,
  GUILD_ID_FIXTURE,
} from '../../../../test';
import {endedPollsHandler} from './endedPollsHandler';
import {prismaMock} from '../../../../test/prismaMock';
import {SWEEP_EXTERNAL_URL} from '../config';

const DB_ENTRY = {
  channelID: '886976610018934824',
  contractAddress: ETH_ADDRESS_FIXTURE,
  createdAt: new Date(0),
  dateEnd: new Date(10),
  guildID: GUILD_ID_FIXTURE,
  id: 1,
  messageID: '123456789',
  options: {'🇦': 50, '🇧': 100, '🇨': 150, '🚫': 'None'},
  processed: false,
  question: 'How much to sweep larvalads fam?',
  result: 0,
};

const DB_ENTRY_1 = {
  channelID: '886976610018934824',
  contractAddress: ETH_ADDRESS_FIXTURE,
  createdAt: new Date(0),
  dateEnd: new Date(15),
  guildID: GUILD_ID_FIXTURE,
  id: 2,
  messageID: '987654321',
  options: {'🇦': 150, '🇧': 200, '🇨': 250, '🚫': 'None'},
  processed: false,
  question: 'How much to sweep bladerunner punks fam?',
  result: 0,
};

describe('endedPollsHandler unit tests', () => {
  test('should process ended poll', async () => {
    /**
     * Mock db fetch
     *
     * @todo fix types
     */
    const dbFindManyMock = (
      prismaMock.floorSweeperPoll as any
    ).findMany.mockResolvedValue([DB_ENTRY, DB_ENTRY_1]);

    // Mock `getDaos`
    const getDaosSpy = jest
      .spyOn(await import('../../../services/dao/getDaos'), 'getDaos')
      .mockImplementation(async () => FAKE_DAOS_FIXTURE);

    const client = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      ],
      partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    });

    // `Client` needs a token to make a REST call
    client.token = 'abc123';

    // Mock `setInterval`
    // const setIntervalSpy = jest.spyOn(global, 'setInterval');

    const messagesReplySpy = jest.fn();

    const messagesFetchSpy = jest.fn().mockImplementation(() => ({
      reactions: {
        cache: [
          {count: 10, emoji: {name: '🇦'}},
          {count: 40, emoji: {name: '🇧'}},
          {count: 30, emoji: {name: '🇨'}},
          {count: 7, emoji: {name: '🚫'}},
        ],
      },
      reply: messagesReplySpy,
    }));

    const messagesSendSpy = jest.fn().mockImplementation(() => ({
      url: 'https://discord.com/some/message/url',
    }));

    /**
     * Mock `Client.channels.fetch` with just enough data
     */
    const channelsFetchSpy = jest
      .spyOn(client.channels, 'fetch')
      .mockImplementation(
        () =>
          ({
            messages: {
              fetch: messagesFetchSpy,
            },
            send: messagesSendSpy,
          } as any)
      );

    /**
     * @see https://jestjs.io/docs/timer-mocks
     */
    jest.useFakeTimers();

    // Run handler
    endedPollsHandler({client, checkInterval: 1000});

    jest.advanceTimersByTime(2000);

    // Not sure exactly why this is needed, but the tests only pass using this
    jest.useRealTimers();

    // Not sure exactly why this is needed, but the tests only pass using this
    await new Promise((r) => setTimeout(r, 0));

    /**
     * Assert channels fetch
     */

    // Once at the start, and once at the end for two DB entries
    expect(channelsFetchSpy).toHaveBeenCalledTimes(8);

    /**
     * Assert messages fetch
     */

    expect(messagesFetchSpy).toHaveBeenCalledTimes(4);

    /**
     * Assert Discord result channel's message `content`
     */
    expect(messagesSendSpy).toHaveBeenCalledTimes(4);

    // Call 2 is the same.
    expect(messagesSendSpy.mock.calls[0][0].content).toMatch(
      /The poll \"\*How much to sweep larvalads fam\?\*\" ended <t:0:R>\. The result was \*\*100 ETH\*\*\./i
    );

    // Call 4 is the same.
    expect(messagesSendSpy.mock.calls[1][0].content).toMatch(
      /The poll \"\*How much to sweep bladerunner punks fam\?\*\" ended <t:0:R>\. The result was \*\*200 ETH\*\*\./i
    );

    /**
     * Assert sweep buttons
     */

    expect(messagesSendSpy.mock.calls[0][0].components[0]).toEqual(
      new MessageActionRow().addComponents(
        new MessageButton()
          .setLabel('Sweep')
          .setStyle('LINK')
          .setURL(
            `${SWEEP_EXTERNAL_URL}/?amount=${100}&contractAddress=${ETH_ADDRESS_FIXTURE}`
          )
          .setEmoji('🧹')
      )
    );

    expect(messagesSendSpy.mock.calls[1][0].components[0]).toEqual(
      new MessageActionRow().addComponents(
        new MessageButton()
          .setLabel('Sweep')
          .setStyle('LINK')
          .setURL(
            `${SWEEP_EXTERNAL_URL}/?amount=${200}&contractAddress=${ETH_ADDRESS_FIXTURE}`
          )
          .setEmoji('🧹')
      )
    );

    expect(messagesSendSpy.mock.calls[0][0].components[0]).toBeInstanceOf(
      MessageActionRow
    );

    expect(messagesSendSpy.mock.calls[1][0].components[0]).toBeInstanceOf(
      MessageActionRow
    );

    /**
     * Assert message sent in poll channel
     */

    expect(messagesReplySpy).toHaveBeenCalledTimes(4);

    expect(messagesReplySpy.mock.calls[0][0].embeds[0].title).toMatch(/sweep/i);
    expect(messagesReplySpy.mock.calls[1][0].embeds[0].title).toMatch(/sweep/i);

    expect(messagesReplySpy.mock.calls[0][0].embeds[0].url).toBe(
      'https://discord.com/some/message/url'
    );

    expect(messagesReplySpy.mock.calls[1][0].embeds[0].url).toBe(
      'https://discord.com/some/message/url'
    );

    expect(messagesReplySpy.mock.calls[0][0].embeds[0].description).toMatch(
      /The poll \"\*How much to sweep larvalads fam\?\*\" ended <t:0:R>\. The result was \*\*100 ETH\*\*/i
    );

    expect(messagesReplySpy.mock.calls[1][0].embeds[0].description).toMatch(
      /The poll \"\*How much to sweep bladerunner punks fam\?\*\" ended <t:0:R>\. The result was \*\*200 ETH\*\*/i
    );

    expect(messagesReplySpy.mock.calls[0][0].embeds[0]).toBeInstanceOf(
      MessageEmbed
    );

    expect(messagesReplySpy.mock.calls[1][0].embeds[0]).toBeInstanceOf(
      MessageEmbed
    );

    // Cleanup

    channelsFetchSpy.mockRestore();
    dbFindManyMock.mockRestore();
    getDaosSpy.mockRestore();
    messagesFetchSpy.mockRestore();
    messagesReplySpy.mockRestore();
    messagesSendSpy.mockRestore();
  });

  test('should process ended poll when result was `None`', async () => {
    /**
     * Mock db fetch
     *
     * @todo fix types
     */
    const dbFindManyMock = (
      prismaMock.floorSweeperPoll as any
    ).findMany.mockResolvedValue([DB_ENTRY]);

    // Mock `getDaos`
    const getDaosSpy = jest
      .spyOn(await import('../../../services/dao/getDaos'), 'getDaos')
      .mockImplementation(async () => FAKE_DAOS_FIXTURE);

    const client = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      ],
      partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    });

    // `Client` needs a token to make a REST call
    client.token = 'abc123';

    const messagesReplySpy = jest.fn();

    const messagesFetchSpy = jest.fn().mockImplementation(() => ({
      reactions: {
        cache: [
          {count: 10, emoji: {name: '🇦'}},
          {count: 40, emoji: {name: '🇧'}},
          {count: 30, emoji: {name: '🇨'}},
          // Result should be this
          {count: 100, emoji: {name: '🚫'}},
        ],
      },
      reply: messagesReplySpy,
    }));

    const messagesSendSpy = jest.fn().mockImplementation(() => ({
      url: 'https://discord.com/some/message/url',
    }));

    /**
     * Mock `Client.channels.fetch` with just enough data
     */
    const channelsFetchSpy = jest
      .spyOn(client.channels, 'fetch')
      .mockImplementation(
        () =>
          ({
            messages: {
              fetch: messagesFetchSpy,
            },
            send: messagesSendSpy,
          } as any)
      );

    /**
     * @see https://jestjs.io/docs/timer-mocks
     */
    jest.useFakeTimers();

    // Run handler
    endedPollsHandler({client, checkInterval: 1000});

    jest.advanceTimersByTime(1000);

    // Not sure exactly why this is needed, but the tests only pass using this
    jest.useRealTimers();

    // Not sure exactly why this is needed, but the tests only pass using this
    await new Promise((r) => setTimeout(r, 0));

    /**
     * Assert Discord result channel's message `content`
     */
    expect(messagesSendSpy).toHaveBeenCalledTimes(0);

    /**
     * Assert message sent in poll channel
     */

    expect(messagesReplySpy).toHaveBeenCalledTimes(1);
    expect(messagesReplySpy.mock.calls[0][0].embeds[0].title).toMatch(/sweep/i);
    expect(messagesReplySpy.mock.calls[0][0].embeds[0].url).toBe('');

    expect(messagesReplySpy.mock.calls[0][0].embeds[0].description).toMatch(
      /The poll \"\*How much to sweep larvalads fam\?\*\" ended <t:0:R>\. The result was \*\*None\*\*/i
    );

    expect(messagesReplySpy.mock.calls[0][0].embeds[0]).toBeInstanceOf(
      MessageEmbed
    );

    // Cleanup

    channelsFetchSpy.mockRestore();
    dbFindManyMock.mockRestore();
    getDaosSpy.mockRestore();
    messagesFetchSpy.mockRestore();
    messagesReplySpy.mockRestore();
    messagesSendSpy.mockRestore();
  });
});
