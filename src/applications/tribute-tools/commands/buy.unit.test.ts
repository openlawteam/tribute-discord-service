import {
  Client,
  ClientOptions,
  Intents,
  InteractionReplyOptions,
} from 'discord.js';
import {RawInteractionData} from 'discord.js/typings/rawDataTypes';

import {
  ETH_ADDRESS_FIXTURE,
  FAKE_DAOS_FIXTURE,
  FakeDiscordCommandInteraction,
  GUILD_ID_FIXTURE,
} from '../../../../test';
import {buy} from './buy';
import {prismaMock} from '../../../../test/prismaMock';
import {rest, server} from '../../../../test/msw/server';

describe('buy unit tests', () => {
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
    {
      name: 'url',
      type: 3 /* `STRING` */,
      value:
        'https://opensea.io/assets/0x335eeef8e93a7a757d9e7912044d9cd264e2b2d8/4079',
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
      name: 'buy',
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

  const GEM_RESPONSE_FIXTURE = {
    hasNext: true,
    total: 1,
    data: [
      {
        _id: '6195e798d1f72e1267eee0d9',
        id: '5314',
        name: 'Sad Girl #5314',
        address: '0x335eeef8e93a7a757d9e7912044d9cd264e2b2d8',
        collectionName: 'Sad Girls Bar',
        collectionSymbol: 'SadGirlsBar',
        externalLink: null,
        imageUrl:
          'https://lh3.googleusercontent.com/r3gMEx-kj7pCaXZDhOwdqkyr82t4UnjSWjrIMKBSyKixfQqFiju98RBUS3NRA6CP_eb6_Lc8Kd_YxTBjD9epzPF4ODv65ZKG7R0D',
        smallImageUrl:
          'https://lh3.googleusercontent.com/r3gMEx-kj7pCaXZDhOwdqkyr82t4UnjSWjrIMKBSyKixfQqFiju98RBUS3NRA6CP_eb6_Lc8Kd_YxTBjD9epzPF4ODv65ZKG7R0D=s250',
        animationUrl: null,
        standard: 'ERC721',
        decimals: 0,
        traits: [Array],
        creator: [Object],
        owner: [Object],
        currentBasePrice: 285000000000000000,
        duration: 243082,
        endingPrice: 285000000000000000,
        ethReserves: null,
        market: 'opensea',
        marketUrl:
          'https://opensea.io/assets/0x335eeef8e93a7a757d9e7912044d9cd264e2b2d8/5314',
        openseaOrderCreatedAt: '1644322191',
        paymentToken: [Object],
        startingPrice: 285000000000000000,
        tokenReserves: null,
        rarityScore: 4463,
        marketplace: 'opensea',
        tokenId: '5314',
        priceInfo: {
          price: '285000000000000000',
          asset: '0x0000000000000000000000000000000000000000',
          decimals: 18,
          startingPrice: '285000000000000000',
          endingPrice: '285000000000000000',
          fees: null,
        },
        url: 'https://opensea.io/assets/0x335eeef8e93a7a757d9e7912044d9cd264e2b2d8/5314',
        tokenType: 'ERC721',
      },
    ],
  };

  const DB_INSERT_DATA = {
    channelID: '886976610018934824',
    contractAddress: ETH_ADDRESS_FIXTURE,
    createdAt: new Date(0),
    guildID: '722525233755717762',
    id: 1,
    messageID: '123456789',
    name: 'Sad Girl #5314',
    processed: false,
    tokenID: '5314',
    upvoteCount: 0,
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
    (prismaMock.buyNFTPoll as any).create.mockResolvedValue(DB_INSERT_DATA);

    server.use(
      rest.post(
        'https://gem-public-api.herokuapp.com/assets',
        async (_req, res, ctx) => res(ctx.json(GEM_RESPONSE_FIXTURE))
      )
    );

    // Mock `getDaos`
    const getDaosSpy = jest
      .spyOn(await import('../../../services/dao/getDaos'), 'getDaos')
      .mockImplementation(async () => FAKE_DAOS_FIXTURE);

    const interactionReplySpy = jest
      .spyOn(interaction, 'reply')
      .mockImplementation(
        async (_o) =>
          (await {guildId: '722525233755717762', react: reactSpy}) as any
      );

    const buyResult = await buy.execute(interaction);

    expect(buyResult).toBe(undefined);
    expect(interactionReplySpy.mock.calls.length).toBe(1);

    expect(
      (interactionReplySpy.mock.calls[0][0] as InteractionReplyOptions)
        .embeds?.[0]?.description
    ).toMatch(/📊 \*\*Should we buy it for 0\.285 ETH\?\*\*/i);

    expect(
      (interactionReplySpy.mock.calls[0][0] as InteractionReplyOptions)
        .embeds?.[0]?.image?.url
    ).toBe(GEM_RESPONSE_FIXTURE.data[0].smallImageUrl);

    expect(
      (interactionReplySpy.mock.calls[0][0] as InteractionReplyOptions)
        .embeds?.[0]?.title
    ).toBe(GEM_RESPONSE_FIXTURE.data[0].name);

    expect(
      (interactionReplySpy.mock.calls[0][0] as InteractionReplyOptions)
        .embeds?.[0]?.footer?.text
    ).toMatch(
      /After a threshold has been reached the vote is final,\neven if you change your vote\./i
    );

    expect(
      (interactionReplySpy.mock.calls[0][0] as InteractionReplyOptions)
        .embeds?.[0]?.fields
    ).toEqual([{inline: false, name: 'Vote Threshold', value: '3 upvotes'}]);

    expect(reactSpy.mock.calls.length).toBe(2);
    expect(reactSpy.mock.calls).toEqual([['👍'], ['👎']]);

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

    const buyResult = await buy.execute(interaction);

    expect(buyResult).toBe(undefined);
    expect(interactionReplySpy.mock.calls.length).toBe(0);
    expect(reactSpy.mock.calls.length).toBe(0);
  });

  test('should reply with error if `url` option is not valid', async () => {
    const client = new Client(CLIENT_OPTIONS);

    const interaction = new FakeDiscordCommandInteraction(client, {
      ...INTERACTION_DATA,
      data: {
        ...INTERACTION_DATA.data,
        options: [{name: 'url', type: 3, value: 'meow meow'}],
      },
    });

    const reactSpy = jest.fn();

    const interactionReplySpy = jest
      .spyOn(interaction, 'reply')
      .mockImplementation(
        async (_o) =>
          (await {guildId: '722525233755717762', react: reactSpy}) as any
      );

    const buyResult = await buy.execute(interaction);

    expect(buyResult).toBe(undefined);
    expect(interactionReplySpy.mock.calls.length).toBe(1);

    expect(interactionReplySpy.mock.calls[0][0]).toEqual({
      content: 'The URL is invalid.',
      ephemeral: true,
    });
  });

  test('should reply with error if `url` option `host` is not valid', async () => {
    const client = new Client(CLIENT_OPTIONS);

    const interaction = new FakeDiscordCommandInteraction(client, {
      ...INTERACTION_DATA,
      data: {
        ...INTERACTION_DATA.data,
        options: [
          {
            name: 'url',
            type: 3,
            value: `https://genie.xyz/asset/${ETH_ADDRESS_FIXTURE}/5`,
          },
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

    const buyResult = await buy.execute(interaction);

    expect(buyResult).toBe(undefined);
    expect(interactionReplySpy.mock.calls.length).toBe(1);

    expect(interactionReplySpy.mock.calls[0][0]).toEqual({
      content:
        'The URL host is not approved. Currently supported: OpenSea, Gem.',
      ephemeral: true,
    });
  });

  test('should reply with error if `url` address path fragment is not valid', async () => {
    const client = new Client(CLIENT_OPTIONS);

    const interaction = new FakeDiscordCommandInteraction(client, {
      ...INTERACTION_DATA,
      data: {
        ...INTERACTION_DATA.data,
        options: [
          {
            name: 'url',
            type: 3,
            // Bad address
            value: `https://gem.xyz/asset/0x0123/5`,
          },
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

    const buyResult = await buy.execute(interaction);

    expect(buyResult).toBe(undefined);
    expect(interactionReplySpy.mock.calls.length).toBe(1);

    expect(interactionReplySpy.mock.calls[0][0]).toEqual({
      content: "Could not get the NFT's information. Please check the URL.",
      ephemeral: true,
    });
  });

  test('should reply with error if `url` address token ID fragment is not valid', async () => {
    const client = new Client(CLIENT_OPTIONS);

    const interaction = new FakeDiscordCommandInteraction(client, {
      ...INTERACTION_DATA,
      data: {
        ...INTERACTION_DATA.data,
        options: [
          {
            name: 'url',
            type: 3,
            // Bad token ID
            value: `https://gem.xyz/asset/${ETH_ADDRESS_FIXTURE}/abcdef`,
          },
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

    const buyResult = await buy.execute(interaction);

    expect(buyResult).toBe(undefined);
    expect(interactionReplySpy.mock.calls.length).toBe(1);

    expect(interactionReplySpy.mock.calls[0][0]).toEqual({
      content: "Could not get the NFT's information. Please check the URL.",
      ephemeral: true,
    });
  });

  test('should reply with error if Gem response has no price information', async () => {
    const client = new Client(CLIENT_OPTIONS);

    const interaction = new FakeDiscordCommandInteraction(
      client,
      INTERACTION_DATA
    );

    const reactSpy = jest.fn();

    server.use(
      rest.post(
        'https://gem-public-api.herokuapp.com/assets',
        async (_req, res, ctx) =>
          res(
            ctx.json({
              ...GEM_RESPONSE_FIXTURE,
              data: [{...GEM_RESPONSE_FIXTURE.data[0], priceInfo: null}],
            })
          )
      )
    );

    const interactionReplySpy = jest
      .spyOn(interaction, 'reply')
      .mockImplementation(
        async (_o) =>
          (await {guildId: '722525233755717762', react: reactSpy}) as any
      );

    const buyResult = await buy.execute(interaction);

    expect(buyResult).toBe(undefined);
    expect(interactionReplySpy.mock.calls.length).toBe(1);

    expect(interactionReplySpy.mock.calls[0][0]).toEqual({
      content:
        'Asset has no price information in Gem. It may be a brand new listing, or not for sale?',
      ephemeral: true,
    });
  });

  test('should reply with error if Gem response has no `name`', async () => {
    const client = new Client(CLIENT_OPTIONS);

    const interaction = new FakeDiscordCommandInteraction(
      client,
      INTERACTION_DATA
    );

    const reactSpy = jest.fn();

    server.use(
      rest.post(
        'https://gem-public-api.herokuapp.com/assets',
        async (_req, res, ctx) =>
          res(
            ctx.json({
              ...GEM_RESPONSE_FIXTURE,
              data: [{...GEM_RESPONSE_FIXTURE.data[0], name: null}],
            })
          )
      )
    );

    const interactionReplySpy = jest
      .spyOn(interaction, 'reply')
      .mockImplementation(
        async (_o) =>
          (await {guildId: '722525233755717762', react: reactSpy}) as any
      );

    const buyResult = await buy.execute(interaction);

    expect(buyResult).toBe(undefined);
    expect(interactionReplySpy.mock.calls.length).toBe(1);

    expect(interactionReplySpy.mock.calls[0][0]).toEqual({
      content: "The NFT's data was returned incomplete.",
      ephemeral: true,
    });
  });

  test('should reply with error if Gem response has no `smallImageUrl`', async () => {
    const client = new Client(CLIENT_OPTIONS);

    const interaction = new FakeDiscordCommandInteraction(
      client,
      INTERACTION_DATA
    );

    const reactSpy = jest.fn();

    server.use(
      rest.post(
        'https://gem-public-api.herokuapp.com/assets',
        async (_req, res, ctx) =>
          res(
            ctx.json({
              ...GEM_RESPONSE_FIXTURE,
              data: [{...GEM_RESPONSE_FIXTURE.data[0], smallImageUrl: null}],
            })
          )
      )
    );

    const interactionReplySpy = jest
      .spyOn(interaction, 'reply')
      .mockImplementation(
        async (_o) =>
          (await {guildId: '722525233755717762', react: reactSpy}) as any
      );

    const buyResult = await buy.execute(interaction);

    expect(buyResult).toBe(undefined);
    expect(interactionReplySpy.mock.calls.length).toBe(1);

    expect(interactionReplySpy.mock.calls[0][0]).toEqual({
      content: "The NFT's data was returned incomplete.",
      ephemeral: true,
    });
  });

  test('should reply with error if Gem response is not OK', async () => {
    const client = new Client(CLIENT_OPTIONS);

    const interaction = new FakeDiscordCommandInteraction(
      client,
      INTERACTION_DATA
    );

    const reactSpy = jest.fn();

    server.use(
      rest.post(
        'https://gem-public-api.herokuapp.com/assets',
        async (_req, res, ctx) => res(ctx.status(500))
      )
    );

    const interactionReplySpy = jest
      .spyOn(interaction, 'reply')
      .mockImplementation(
        async (_o) =>
          (await {guildId: '722525233755717762', react: reactSpy}) as any
      );

    const buyResult = await buy.execute(interaction);

    expect(buyResult).toBe(undefined);
    expect(interactionReplySpy.mock.calls.length).toBe(1);

    expect(interactionReplySpy.mock.calls[0][0]).toEqual({
      content: 'Something went wrong while setting up the poll.',
      ephemeral: true,
    });
  });

  test('should reply with error if DAO is not found', async () => {
    const client = new Client(CLIENT_OPTIONS);

    const interaction = new FakeDiscordCommandInteraction(
      client,
      INTERACTION_DATA
    );

    const reactSpy = jest.fn();

    server.use(
      rest.post(
        'https://gem-public-api.herokuapp.com/assets',
        async (_req, res, ctx) => res(ctx.json(GEM_RESPONSE_FIXTURE))
      )
    );

    // Mock `getDaos`
    const getDaosSpy = jest
      .spyOn(await import('../../../services/dao/getDaos'), 'getDaos')
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

    await buy.execute(interaction);

    expect(interactionReplySpy.mock.calls[0][0]).toEqual({
      content: 'Something went wrong while setting up the poll.',
      ephemeral: true,
    });
  });

  test('should reply with error and delete poll if no `guildId` returned from `reply`', async () => {
    const client = new Client(CLIENT_OPTIONS);

    const interaction = new FakeDiscordCommandInteraction(
      client,
      INTERACTION_DATA
    );

    const deleteSpy = jest.fn();
    const reactSpy = jest.fn();

    /**
     * Mock db insert error
     *
     * @todo fix types
     */
    (prismaMock.buyNFTPoll as any).create.mockImplementation(() => {
      throw new Error('Some bad error');
    });

    server.use(
      rest.post(
        'https://gem-public-api.herokuapp.com/assets',
        async (_req, res, ctx) => res(ctx.json(GEM_RESPONSE_FIXTURE))
      )
    );

    // Mock `getDaos`
    const getDaosSpy = jest
      .spyOn(await import('../../../services/dao/getDaos'), 'getDaos')
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

    await buy.execute(interaction);

    expect(interactionReplySpy.mock.calls.length).toBe(1);
    expect(reactSpy.mock.calls.length).toBe(0);
    expect(interactionFollowUpSpy.mock.calls.length).toBe(1);

    expect(interactionFollowUpSpy.mock.calls[0][0]).toEqual({
      content: 'Something went wrong while setting up the poll.',
      ephemeral: true,
    });

    expect(deleteSpy.mock.calls.length).toBe(1);

    // Cleanup

    getDaosSpy.mockRestore();
    interactionFollowUpSpy.mockRestore();
    interactionReplySpy.mockRestore();
  });

  test('should reply with error and delete poll if DB create entry fails', async () => {
    const client = new Client(CLIENT_OPTIONS);

    const interaction = new FakeDiscordCommandInteraction(
      client,
      INTERACTION_DATA
    );

    const deleteSpy = jest.fn();
    const reactSpy = jest.fn();

    /**
     * Mock db insert error
     *
     * @todo fix types
     */
    (prismaMock.buyNFTPoll as any).create.mockImplementation(() => {
      throw new Error('Some bad error');
    });

    server.use(
      rest.post(
        'https://gem-public-api.herokuapp.com/assets',
        async (_req, res, ctx) => res(ctx.json(GEM_RESPONSE_FIXTURE))
      )
    );

    // Mock `getDaos`
    const getDaosSpy = jest
      .spyOn(await import('../../../services/dao/getDaos'), 'getDaos')
      .mockImplementation(async () => FAKE_DAOS_FIXTURE);

    const interactionReplySpy = jest
      .spyOn(interaction, 'reply')
      .mockImplementation(
        async (_o) =>
          (await {
            delete: deleteSpy,
            guildId: '722525233755717762',
            react: reactSpy,
          }) as any
      );

    const interactionFollowUpSpy = jest
      .spyOn(interaction, 'followUp')
      .mockImplementation(async (_o) => (await {}) as any);

    await buy.execute(interaction);

    expect(interactionReplySpy.mock.calls.length).toBe(1);
    expect(reactSpy.mock.calls.length).toBe(0);
    expect(interactionFollowUpSpy.mock.calls.length).toBe(1);

    expect(interactionFollowUpSpy.mock.calls[0][0]).toEqual({
      content: 'Something went wrong while setting up the poll.',
      ephemeral: true,
    });

    expect(deleteSpy.mock.calls.length).toBe(1);

    // Cleanup

    getDaosSpy.mockRestore();
    interactionFollowUpSpy.mockRestore();
    interactionReplySpy.mockRestore();
  });

  test('should reply with error and delete poll if Discord reaction fails', async () => {
    const client = new Client(CLIENT_OPTIONS);

    const interaction = new FakeDiscordCommandInteraction(
      client,
      INTERACTION_DATA
    );

    const deleteSpy = jest.fn();

    const reactSpy = jest.fn().mockImplementation(() => {
      throw new Error('Some bad error');
    });

    /**
     * Mock db insert entry
     *
     * @todo fix types
     */
    (prismaMock.buyNFTPoll as any).create.mockResolvedValue(DB_INSERT_DATA);

    server.use(
      rest.post(
        'https://gem-public-api.herokuapp.com/assets',
        async (_req, res, ctx) => res(ctx.json(GEM_RESPONSE_FIXTURE))
      )
    );

    // Mock `getDaos`
    const getDaosSpy = jest
      .spyOn(await import('../../../services/dao/getDaos'), 'getDaos')
      .mockImplementation(async () => FAKE_DAOS_FIXTURE);

    const interactionReplySpy = jest
      .spyOn(interaction, 'reply')
      .mockImplementation(
        async (_o) =>
          (await {
            delete: deleteSpy,
            guildId: '722525233755717762',
            react: reactSpy,
          }) as any
      );

    const interactionFollowUpSpy = jest
      .spyOn(interaction, 'followUp')
      .mockImplementation(async (_o) => (await {}) as any);

    await buy.execute(interaction);

    expect(interactionReplySpy.mock.calls.length).toBe(1);
    expect(reactSpy.mock.calls.length).toBe(1);
    expect(interactionFollowUpSpy.mock.calls.length).toBe(1);

    expect(interactionFollowUpSpy.mock.calls[0][0]).toEqual({
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
