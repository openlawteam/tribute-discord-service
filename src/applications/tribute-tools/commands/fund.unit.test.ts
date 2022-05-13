import {
  Client,
  ClientOptions,
  Intents,
  InteractionReplyOptions,
  MessageActionRow,
  MessageButton,
} from 'discord.js';
import {RawInteractionData} from 'discord.js/typings/rawDataTypes';

import {
  ETH_ADDRESS_FIXTURE,
  FAKE_DAOS_FIXTURE,
  FakeDiscordCommandInteraction,
  GUILD_ID_FIXTURE,
} from '../../../../test';
import {CANCEL_POLL_FUND_CUSTOM_ID, THUMBS_EMOJIS} from '../config';
import {DaoDiscordConfig} from '../../../config';
import {fund} from './fund';
import {prismaMock} from '../../../../test/prismaMock';

describe('fund unit tests', () => {
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
    {name: 'address_to_fund', type: 3, value: ETH_ADDRESS_FIXTURE},
    {name: 'amount_in_usdc', type: 10, value: 50000.55},
    {
      name: 'purpose',
      type: 3,
      value: 'Seed round for Tribute Labs',
    },
  ];

  const INTERACTION_DATA: RawInteractionData = {
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
      name: 'fund',
      options: INTERACTION_OPTIONS,
      type: 1,
    },

    /**
     * The guild it was sent from
     */
    guild_id: GUILD_ID_FIXTURE,
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
    addressToFund: ETH_ADDRESS_FIXTURE,
    amountUSDC: 50000.55,
    channelID: '886976610018934824',
    createdAt: new Date(0),
    guildID: '722525233755717762',
    id: 1,
    messageID: '123456789',
    processed: false,
    purpose: 'XYZ Seed Round',
    upvoteCount: 0,
    uuid: 'abc123def456',
    voteThreshold: 3,
  };

  test('should run execute', async () => {
    const client = new Client(CLIENT_OPTIONS);

    const interaction = new FakeDiscordCommandInteraction(
      client,
      INTERACTION_DATA
    );

    const reactSpy = jest.fn();

    /**
     * Mock db insert entry
     *
     * @todo fix types
     */
    (prismaMock.fundAddressPoll as any).create.mockResolvedValue(
      DB_INSERT_DATA
    );

    const interactionReplySpy = jest
      .spyOn(interaction, 'reply')
      .mockImplementation(
        async (_o) =>
          (await {guildId: GUILD_ID_FIXTURE, react: reactSpy}) as any
      );

    // Mock getting dao discord configs
    const getDaosSpy = jest
      .spyOn(
        await import('../../../services/discordConfig/getDaoDiscordConfigs'),
        'getDaoDiscordConfigs'
      )
      .mockImplementation(async () => FAKE_DAOS_FIXTURE);

    const fundResult = await fund.execute(interaction);

    expect(fundResult).toBe(undefined);
    expect(interactionReplySpy).toHaveBeenCalledTimes(1);

    expect(
      (interactionReplySpy.mock.calls[0][0] as InteractionReplyOptions)
        .embeds?.[0]?.title
    ).toMatch(/Seed round for Tribute Labs/i);

    expect(
      (interactionReplySpy.mock.calls[0][0] as InteractionReplyOptions)
        .embeds?.[0]?.url
    ).toBe(`https://etherscan.io/address/${ETH_ADDRESS_FIXTURE}`);

    expect(
      (interactionReplySpy.mock.calls[0][0] as InteractionReplyOptions)
        .embeds?.[0]?.description
    ).toMatch(
      /📊 \*\*Should we fund `0x04028Df0Cea639E97fDD3fC01bA5CC172613211D` for \$50,000\.55 USDC\?\*\*/i
    );

    expect(
      (interactionReplySpy.mock.calls[0][0] as InteractionReplyOptions)
        .embeds?.[0]?.fields?.[0].name
    ).toMatch(/vote threshold/i);

    expect(
      (interactionReplySpy.mock.calls[0][0] as InteractionReplyOptions)
        .embeds?.[0]?.fields?.[0].value
    ).toMatch(/3 upvotes/i);

    expect(
      (interactionReplySpy.mock.calls[0][0] as InteractionReplyOptions)
        .components
    ).toEqual([
      new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId(CANCEL_POLL_FUND_CUSTOM_ID)
          .setLabel('Cancel poll')
          .setStyle('SECONDARY')
      ),
    ]);

    expect(reactSpy).toHaveBeenCalledTimes(2);
    expect(reactSpy).toHaveBeenNthCalledWith(1, THUMBS_EMOJIS[0]);
    expect(reactSpy).toHaveBeenNthCalledWith(2, THUMBS_EMOJIS[1]);

    // Cleanup

    getDaosSpy.mockRestore();
    interactionReplySpy.mockRestore();
  });

  test('should not run execute if interaction not command', async () => {
    const client = new Client(CLIENT_OPTIONS);

    const interaction = new FakeDiscordCommandInteraction(client, {
      ...INTERACTION_DATA,
      type: 1,
    });

    const reactSpy = jest.fn();

    const interactionReplySpy = jest
      .spyOn(interaction, 'reply')
      .mockImplementation(
        async (_o) =>
          (await {guildId: '722525233755717762', react: reactSpy}) as any
      );

    const fundResult = await fund.execute(interaction);

    expect(fundResult).toBe(undefined);
    expect(interactionReplySpy.mock.calls.length).toBe(0);
    expect(reactSpy.mock.calls.length).toBe(0);

    // Cleanup

    interactionReplySpy.mockRestore();
  });

  test('should reply with error if `address_to_fund` option is not valid', async () => {
    const client = new Client(CLIENT_OPTIONS);

    const interaction = new FakeDiscordCommandInteraction(client, {
      ...INTERACTION_DATA,
      data: {
        ...INTERACTION_DATA.data,
        options: [{name: 'address_to_fund', type: 3, value: '0x0'}],
      },
    });

    const reactSpy = jest.fn();

    const interactionReplySpy = jest
      .spyOn(interaction, 'reply')
      .mockImplementation(
        async (_o) =>
          (await {guildId: '722525233755717762', react: reactSpy}) as any
      );

    const fundResult = await fund.execute(interaction);

    expect(fundResult).toBe(undefined);
    expect(interactionReplySpy.mock.calls.length).toBe(1);

    expect(interactionReplySpy.mock.calls[0][0]).toEqual({
      content:
        'Invalid Ethereum address. Try something like: 0x000000000000000000000000000000000000bEEF.',
      ephemeral: true,
    });

    // Cleanup

    interactionReplySpy.mockRestore();
  });

  test('should reply with error if `amount_in_usdc` option is not valid', async () => {
    const client = new Client(CLIENT_OPTIONS);

    const interaction = new FakeDiscordCommandInteraction(client, {
      ...INTERACTION_DATA,
      data: {
        ...INTERACTION_DATA.data,
        options: [
          {name: 'address_to_fund', type: 3, value: ETH_ADDRESS_FIXTURE},
          // `0` value
          {name: 'amount_in_usdc', type: 10, value: 0},
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

    const fundResult = await fund.execute(interaction);

    expect(fundResult).toBe(undefined);
    expect(interactionReplySpy.mock.calls.length).toBe(1);

    expect(interactionReplySpy.mock.calls[0][0]).toEqual({
      content: 'Invalid USDC amount. Try something like: 50,000.50 or 50000.50',
      ephemeral: true,
    });

    // Cleanup

    interactionReplySpy.mockRestore();
  });

  test('should reply with error if DAO configuration is not found', async () => {
    const client = new Client(CLIENT_OPTIONS);

    const interaction = new FakeDiscordCommandInteraction(
      client,
      INTERACTION_DATA
    );

    const reactSpy = jest.fn();

    // Mock getting dao discord configs
    const getDaosSpy = jest
      .spyOn(
        await import('../../../services/discordConfig/getDaoDiscordConfigs'),
        'getDaoDiscordConfigs'
      )
      // Insert bad guild ID so the dao is not found
      .mockImplementation(async () => ({
        ...FAKE_DAOS_FIXTURE,
        test: {...FAKE_DAOS_FIXTURE.test, guildID: '00000000000000'},
      }));

    const interactionReplySpy = jest
      .spyOn(interaction, 'reply')
      .mockImplementation(
        async (_o) =>
          (await {guildId: '722525233755717762', react: reactSpy}) as any
      );

    await fund.execute(interaction);

    expect(interactionReplySpy.mock.calls[0][0]).toEqual({
      content: 'No dao configuration was found while setting up the poll.',
      ephemeral: true,
    });

    // Cleanup

    getDaosSpy.mockRestore();
    interactionReplySpy.mockRestore();
  });

  test('should reply with error if `voteThreshold` configuration is not found', async () => {
    const client = new Client(CLIENT_OPTIONS);

    const interaction = new FakeDiscordCommandInteraction(
      client,
      INTERACTION_DATA
    );

    const reactSpy = jest.fn();

    // Mock getting dao discord configs
    const getDaosSpy = jest
      .spyOn(
        await import('../../../services/discordConfig/getDaoDiscordConfigs'),
        'getDaoDiscordConfigs'
      )
      .mockImplementation(
        async () =>
          ({
            ...FAKE_DAOS_FIXTURE,
            test: {
              ...FAKE_DAOS_FIXTURE.test,
              applications: {
                ...FAKE_DAOS_FIXTURE.test.applications,
                TRIBUTE_TOOLS_BOT: {
                  ...FAKE_DAOS_FIXTURE.test.applications?.TRIBUTE_TOOLS_BOT,
                  commands: {
                    ...FAKE_DAOS_FIXTURE.test.applications?.TRIBUTE_TOOLS_BOT
                      ?.commands,
                    FUND: {
                      ...FAKE_DAOS_FIXTURE.test.applications?.TRIBUTE_TOOLS_BOT
                        ?.commands.FUND,
                      // Set no vote threshold
                      voteThreshold: 0,
                    },
                  },
                },
              },
            },
          } as Record<string, DaoDiscordConfig>)
      );

    const interactionReplySpy = jest
      .spyOn(interaction, 'reply')
      .mockImplementation(
        async (_o) =>
          (await {guildId: '722525233755717762', react: reactSpy}) as any
      );

    await fund.execute(interaction);

    expect(interactionReplySpy.mock.calls[0][0]).toEqual({
      content:
        'No vote threshold configuration was found while setting up the poll.',
      ephemeral: true,
    });

    // Cleanup

    getDaosSpy.mockRestore();
    interactionReplySpy.mockRestore();
  });

  test('should reply with error and delete poll if no `guildId` returned from `reply`', async () => {
    const client = new Client(CLIENT_OPTIONS);

    const interaction = new FakeDiscordCommandInteraction(
      client,
      INTERACTION_DATA
    );

    const deleteSpy = jest.fn();
    const reactSpy = jest.fn();

    // Mock getting dao discord configs
    const getDaosSpy = jest
      .spyOn(
        await import('../../../services/discordConfig/getDaoDiscordConfigs'),
        'getDaoDiscordConfigs'
      )
      .mockImplementation(async () => FAKE_DAOS_FIXTURE);

    const interactionReplySpy = jest
      .spyOn(interaction, 'reply')
      .mockImplementation(
        async (_o) =>
          // Do not return a `guildID`
          (await {
            delete: deleteSpy,
            react: reactSpy,
          }) as any
      );

    const interactionFollowUpSpy = jest
      .spyOn(interaction, 'followUp')
      .mockImplementation(async (_o) => (await {}) as any);

    await fund.execute(interaction);

    expect(interactionReplySpy).toHaveBeenCalledTimes(1);
    expect(reactSpy).toHaveBeenCalledTimes(0);
    expect(interactionFollowUpSpy).toHaveBeenCalledTimes(1);

    expect(interactionFollowUpSpy).toHaveBeenNthCalledWith(1, {
      content: 'Something went wrong while setting up the poll.',
      ephemeral: true,
    });

    expect(deleteSpy.mock.calls.length).toBe(1);

    // Cleanup

    getDaosSpy.mockRestore();
    interactionFollowUpSpy.mockRestore();
    interactionReplySpy.mockRestore();
  });
});
