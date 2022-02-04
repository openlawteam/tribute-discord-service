import {
  Client,
  ClientOptions,
  CommandInteraction,
  Intents,
  InteractionReplyOptions,
} from 'discord.js';
import {GatewayInteractionCreateDispatchData} from 'discord-api-types';

import {ETH_ADDRESS_FIXTURE} from '../../../../test';
import {prismaMock} from '../../../../test/prismaMock';
import {sweep} from './sweep';

describe('sweep unit tests', () => {
  const CLIENT_OPTIONS: ClientOptions = {
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    restSweepInterval: 0,
  };

  const INTERACTION_OPTIONS = [
    {name: 'how_long', type: 3, value: '1 m'},
    {
      name: 'nft_contract',
      type: 3,
      value: ETH_ADDRESS_FIXTURE,
    },
    {
      name: 'question',
      type: 3,
      value: 'How much to sweep larvalads fam?',
    },
    {name: 'option_a', type: 4, value: 50},
    {name: 'option_b', type: 4, value: 100},
    {name: 'option_c', type: 4, value: 150},
  ];

  const INTERACION_DATA: GatewayInteractionCreateDispatchData = {
    /**
     * ID of the interaction
     */
    id: 'abc2354',
    /**
     * ID of the application this interaction is for
     */
    application_id: '931125521645969448',
    /**
     * The type of interaction
     */
    type: 2,
    /**
     * The command data payload
     */
    data: {
      id: '123456789',
      name: 'sweep',
      options: INTERACTION_OPTIONS,
    },

    /**
     * The guild it was sent from
     */
    guild_id: '722525233755717762',
    /**
     * The channel it was sent from
     */
    channel_id: '886976610018934824',

    /**
     * A continuation token for responding to the interaction
     */
    token:
      'aW50ZXJhY3Rpb246OTMzOTI4Mjc2MjIzNzI5Njc1OlZUT2xKd3kzOFZOWnlEcEIxczFvbjA2aXZabldkUjRQRFVVOVA5VlNVc3lxSk5QTmtQbjhuQmRmajdvaG1ZMzgyTEN6ejU4Y0VUbTV3UGkyZE16VTM3MXRXQTJIa0xISFphTkhaS1ltSGdNNVp5a2UybW5CVzZ3a0tKR1lIaFZl',
    /**
     * Read-only property, always `1`
     */
    version: 1,
    user: {
      id: '718496526103478282',
      bot: false,
      system: false,
      username: 'test',
      discriminator: '8617',
      avatar: 'd2b72ef9b0fc65a89a975faeb4a3a916',
    },
  };

  const DB_INSERT_DATA = {
    channelID: '886976610018934824',
    contractAddress: ETH_ADDRESS_FIXTURE,
    createdAt: new Date(0),
    dateEnd: new Date(10),
    guildID: '722525233755717762',
    id: 1,
    messageID: '123456789',
    options: {'🇦': 50, '🇧': 100, '🇨': 150, '🚫': 'None'},
    processed: false,
    question: 'How much to sweep larvalads fam?',
    result: 50,
  };

  test('should run execute', async () => {
    /**
     * Mock db insert entry
     *
     * @todo fix types
     */
    (prismaMock.floorSweeperPoll as any).create.mockResolvedValue(
      DB_INSERT_DATA
    );

    const client = new Client(CLIENT_OPTIONS);
    const interaction = new CommandInteraction(client, INTERACION_DATA);
    const reactSpy = jest.fn();

    const interactionReplySpy = jest
      .spyOn(interaction, 'reply')
      .mockImplementation(
        async (_o) =>
          (await {guildId: '722525233755717762', react: reactSpy}) as any
      );

    const sweepResult = await sweep.execute(interaction);

    expect(sweepResult).toBe(undefined);
    expect(interactionReplySpy.mock.calls.length).toBe(1);

    expect(
      (interactionReplySpy.mock.calls[0][0] as InteractionReplyOptions).content
    ).toMatch(/📊 \*\*how much to sweep larvalads fam\?\*\*/i);

    expect(
      (interactionReplySpy.mock.calls[0][0] as InteractionReplyOptions)
        .embeds?.[0]?.description
    ).toMatch(/🇦: 50 ETH\n🇧: 100 ETH\n🇨: 150 ETH\n🚫: None\n/i);

    expect(
      (interactionReplySpy.mock.calls[0][0] as InteractionReplyOptions)
        .embeds?.[0]?.fields?.[0].value
    ).toMatch(/<t:\d{1,}:F>/i);

    expect(
      (interactionReplySpy.mock.calls[0][0] as InteractionReplyOptions)
        .embeds?.[0]?.fields?.[0].name
    ).toMatch(/⏱ poll ends:/i);

    expect(reactSpy.mock.calls.length).toBe(4);
    expect(reactSpy.mock.calls).toEqual([['🇦'], ['🇧'], ['🇨'], ['🚫']]);
  });

  test('should not include `🚫` option if `0` option provided', async () => {
    /**
     * Mock db insert entry
     *
     * @todo fix types
     */
    (prismaMock.floorSweeperPoll as any).create.mockResolvedValue(
      DB_INSERT_DATA
    );

    const client = new Client(CLIENT_OPTIONS);
    const interaction = new CommandInteraction(client, {
      ...INTERACION_DATA,
      data: {
        ...INTERACION_DATA.data,
        options: [
          {name: 'how_long', type: 3, value: '1 m'},
          {
            name: 'nft_contract',
            type: 3,
            value: ETH_ADDRESS_FIXTURE,
          },
          {
            name: 'question',
            type: 3,
            value: 'How much to sweep larvalads fam?',
          },
          {name: 'option_a', type: 4, value: 50},
          {name: 'option_b', type: 4, value: 100},
          {name: 'option_c', type: 4, value: 150},
          // Include `0` option
          {name: 'option_d', type: 4, value: 0},
        ],
      },
    });

    const reactSpy = jest.fn();

    const interactionReplySpy = jest
      .spyOn(interaction, 'reply')
      .mockImplementation(
        async (_o) =>
          (await {guildId: '722525233755717762', react: reactSpy}) as any
      );

    const sweepResult = await sweep.execute(interaction);

    expect(sweepResult).toBe(undefined);
    expect(interactionReplySpy.mock.calls.length).toBe(1);

    expect(
      (interactionReplySpy.mock.calls[0][0] as InteractionReplyOptions).content
    ).toMatch(/📊 \*\*how much to sweep larvalads fam\?\*\*/i);

    expect(
      (interactionReplySpy.mock.calls[0][0] as InteractionReplyOptions)
        .embeds?.[0]?.description
    ).toMatch(/🇦: 50 ETH\n🇧: 100 ETH\n🇨: 150 ETH\n🇩: 0 ETH\n/i);

    expect(
      (interactionReplySpy.mock.calls[0][0] as InteractionReplyOptions)
        .embeds?.[0]?.fields?.[0].value
    ).toMatch(/<t:\d{1,}:F>/i);

    expect(
      (interactionReplySpy.mock.calls[0][0] as InteractionReplyOptions)
        .embeds?.[0]?.fields?.[0].name
    ).toMatch(/⏱ poll ends:/i);

    expect(reactSpy.mock.calls.length).toBe(4);
    expect(reactSpy.mock.calls).toEqual([['🇦'], ['🇧'], ['🇨'], ['🇩']]);
  });

  test('should not run execute if interaction not command', async () => {
    const client = new Client(CLIENT_OPTIONS);

    const interaction = new CommandInteraction(client, {
      ...INTERACION_DATA,
      type: 1,
    });

    const reactSpy = jest.fn();

    const interactionReplySpy = jest
      .spyOn(interaction, 'reply')
      .mockImplementation(
        async (_o) =>
          (await {guildId: '722525233755717762', react: reactSpy}) as any
      );

    const sweepResult = await sweep.execute(interaction);

    expect(sweepResult).toBe(undefined);
    expect(interactionReplySpy.mock.calls.length).toBe(0);
    expect(reactSpy.mock.calls.length).toBe(0);
  });

  test('should not run execute if no `question`', async () => {
    const client = new Client(CLIENT_OPTIONS);

    const interaction = new CommandInteraction(client, {
      ...INTERACION_DATA,
      data: {
        ...INTERACION_DATA.data,
        options: [
          {name: 'how_long', type: 3, value: '1 m'},
          {
            name: 'nft_contract',
            type: 3,
            value: ETH_ADDRESS_FIXTURE,
          },
          {name: 'option_a', type: 4, value: 50},
          {name: 'option_b', type: 4, value: 100},
          {name: 'option_c', type: 4, value: 150},
        ],
      },
    });

    const reactSpy = jest.fn();

    const interactionReplySpy = jest
      .spyOn(interaction, 'reply')
      .mockImplementation(
        async (_o) =>
          (await {guildId: '722525233755717762', react: reactSpy}) as any
      );

    const sweepResult = await sweep.execute(interaction);

    expect(sweepResult).toBe(undefined);
    expect(interactionReplySpy.mock.calls.length).toBe(0);
    expect(reactSpy.mock.calls.length).toBe(0);
  });

  test('should reply with error if `nft_contract` option is not valid', async () => {
    const client = new Client(CLIENT_OPTIONS);

    const interaction = new CommandInteraction(client, {
      ...INTERACION_DATA,
      data: {
        ...INTERACION_DATA.data,
        options: [
          {name: 'how_long', type: 3, value: '1 m'},
          {
            name: 'nft_contract',
            type: 3,
            // Bad value
            value: '0x0',
          },
          {
            name: 'question',
            type: 3,
            value: 'How much to sweep larvalads fam?',
          },
          {name: 'option_a', type: 4, value: 50},
          {name: 'option_b', type: 4, value: 100},
          {name: 'option_c', type: 4, value: 150},
        ],
      },
    });

    const reactSpy = jest.fn();

    const interactionReplySpy = jest
      .spyOn(interaction, 'reply')
      .mockImplementation(
        async (_o) =>
          (await {guildId: '722525233755717762', react: reactSpy}) as any
      );

    const sweepResult = await sweep.execute(interaction);

    expect(sweepResult).toBe(undefined);
    expect(interactionReplySpy.mock.calls.length).toBe(1);

    expect(interactionReplySpy.mock.calls[0][0]).toEqual({
      content:
        'Invalid Ethereum address. Try something like: 0x000000000000000000000000000000000000bEEF.',
      ephemeral: true,
    });
  });

  test('should reply with error if `how_long` option is not valid', async () => {
    const client = new Client(CLIENT_OPTIONS);

    const interaction = new CommandInteraction(client, {
      ...INTERACION_DATA,
      data: {
        ...INTERACION_DATA.data,
        options: [
          // Bad value
          {name: 'how_long', type: 3, value: '1mo'},
          {
            name: 'nft_contract',
            type: 3,
            value: ETH_ADDRESS_FIXTURE,
          },
          {
            name: 'question',
            type: 3,
            value: 'How much to sweep larvalads fam?',
          },
          {name: 'option_a', type: 4, value: 50},
          {name: 'option_b', type: 4, value: 100},
          {name: 'option_c', type: 4, value: 150},
        ],
      },
    });

    const reactSpy = jest.fn();

    const interactionReplySpy = jest
      .spyOn(interaction, 'reply')
      .mockImplementation(
        async (_o) =>
          (await {guildId: '722525233755717762', react: reactSpy}) as any
      );

    const sweepResult = await sweep.execute(interaction);

    expect(sweepResult).toBe(undefined);
    expect(interactionReplySpy.mock.calls.length).toBe(1);

    expect(interactionReplySpy.mock.calls[0][0]).toEqual({
      content:
        'Invalid duration. Try something like: 20 minutes; 12 hours; 1 day; 1 week. Short: d,w,M,y,h,m,s,ms',
      ephemeral: true,
    });
  });

  test('should reply with error if duplicate numeric options provided', async () => {
    const client = new Client(CLIENT_OPTIONS);

    const interaction = new CommandInteraction(client, {
      ...INTERACION_DATA,
      data: {
        ...INTERACION_DATA.data,
        options: [
          {name: 'how_long', type: 3, value: '1 m'},
          {
            name: 'nft_contract',
            type: 3,
            value: ETH_ADDRESS_FIXTURE,
          },
          {
            name: 'question',
            type: 3,
            value: 'How much to sweep larvalads fam?',
          },
          {name: 'option_a', type: 4, value: 50},
          {name: 'option_b', type: 4, value: 100},
          {name: 'option_c', type: 4, value: 150},
          // Duplicate option
          {name: 'option_d', type: 4, value: 150},
        ],
      },
    });

    const reactSpy = jest.fn();

    const interactionReplySpy = jest
      .spyOn(interaction, 'reply')
      .mockImplementation(
        async (_o) =>
          (await {guildId: '722525233755717762', react: reactSpy}) as any
      );

    const sweepResult = await sweep.execute(interaction);

    expect(sweepResult).toBe(undefined);
    expect(interactionReplySpy.mock.calls.length).toBe(1);

    expect(interactionReplySpy.mock.calls[0][0]).toEqual({
      content: 'Duplicate poll options are not allowed.',
      ephemeral: true,
    });
  });

  test('should throw if no `guildId` returned from `reply`', async () => {
    /**
     * Mock db insert entry
     *
     * @todo fix types
     */
    (prismaMock.floorSweeperPoll as any).create.mockResolvedValue(
      DB_INSERT_DATA
    );

    const client = new Client(CLIENT_OPTIONS);
    const interaction = new CommandInteraction(client, INTERACION_DATA);
    const reactSpy = jest.fn();

    const interactionReplySpy = jest
      .spyOn(interaction, 'reply')
      .mockImplementation(
        async (_o) =>
          // Do not return `guildId`
          (await {react: reactSpy}) as any
      );

    try {
      await sweep.execute(interaction);
    } catch (error) {
      expect((error as Error)?.message).toMatch(
        /No `guildId` was found on `Message` undefined\. Channel: undefined\. Poll question: How much to sweep larvalads fam\?\./i
      );

      expect(interactionReplySpy.mock.calls.length).toBe(1);

      expect(
        (interactionReplySpy.mock.calls[0][0] as InteractionReplyOptions)
          .content
      ).toMatch(/📊 \*\*how much to sweep larvalads fam\?\*\*/i);

      expect(
        (interactionReplySpy.mock.calls[0][0] as InteractionReplyOptions)
          .embeds?.[0]?.description
      ).toMatch(/🇦: 50 ETH\n🇧: 100 ETH\n🇨: 150 ETH\n🚫: None\n/i);

      expect(
        (interactionReplySpy.mock.calls[0][0] as InteractionReplyOptions)
          .embeds?.[0]?.fields?.[0].value
      ).toMatch(/<t:\d{1,}:F>/i);

      expect(
        (interactionReplySpy.mock.calls[0][0] as InteractionReplyOptions)
          .embeds?.[0]?.fields?.[0].name
      ).toMatch(/⏱ poll ends:/i);

      expect(reactSpy.mock.calls.length).toBe(0);
    }
  });
});
