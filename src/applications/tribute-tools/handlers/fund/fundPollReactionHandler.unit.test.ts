import {
  MessageActionRow,
  MessageButton,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from 'discord.js';

import {
  ETH_ADDRESS_FIXTURE,
  FAKE_DAOS_FIXTURE,
  GUILD_ID_FIXTURE,
} from '../../../../../test';
import {FUND_EXTERNAL_URL} from '../../config';
import {fundPollReactionHandler} from './fundPollReactionHandler';
import {prismaMock} from '../../../../../test/prismaMock';

describe('fundPollReactionHandler unit tests', () => {
  const ERROR_REGEXP =
    /Something went wrong while handling the Discord reaction: Error: Some bad error/i;

  test('should increment upvotes on upvote', async () => {
    const REACTION: MessageReaction | PartialMessageReaction = {
      emoji: {name: '👍'},
      message: {
        id: 'abc123',
        reactions: {
          cache: [],
        },
      },
    } as any;

    const USER: User | PartialUser = {bot: false, id: '123'} as any;

    const DB_ENTRY = {
      addressToFund: ETH_ADDRESS_FIXTURE,
      amountUSDC: 50000,
      channelID: '886976610018934824',
      createdAt: new Date(0),
      guildID: GUILD_ID_FIXTURE,
      id: 1,
      messageID: 'abc123',
      processed: false,
      purpose: 'XYZ Seed Round',
      upvoteCount: 1,
      uuid: 'abc123def456',
      voteThreshold: 3,
    };

    /**
     * Mock db return value
     *
     * @todo fix types
     */
    const dbFindSpy = (
      prismaMock.fundAddressPoll as any
    ).findUnique.mockResolvedValue(DB_ENTRY);

    /**
     * Mock db update
     *
     * @todo fix types
     */
    const dbUpdateSpy = (
      prismaMock.fundAddressPoll as any
    ).update.mockImplementation(async () => {});

    await fundPollReactionHandler({reaction: REACTION, user: USER});

    expect(dbFindSpy).toHaveBeenCalledTimes(1);
    expect(dbFindSpy).toHaveBeenCalledWith({where: {messageID: 'abc123'}});
    expect(dbUpdateSpy).toHaveBeenCalledTimes(1);

    expect(dbUpdateSpy.mock.calls[0][0]).toEqual({
      data: {upvoteCount: 2},
      where: {messageID: 'abc123'},
    });

    // Cleanup

    dbFindSpy.mockRestore();
  });

  test('should handle poll threshold reached', async () => {
    const channelSendSpy = jest
      .fn()
      .mockImplementation(async () => ({id: 'xyz456', url: FUND_EXTERNAL_URL}));

    const messageReplySpy = jest.fn();

    const messageFetchSpy = jest
      .fn()
      .mockImplementation(async () => ({reply: messageReplySpy}));

    const channelFetchSpy = jest.fn().mockImplementation(async () => ({
      messages: {fetch: messageFetchSpy},
      send: channelSendSpy,
    }));

    const REACTION: MessageReaction | PartialMessageReaction = {
      client: {
        channels: {
          fetch: channelFetchSpy,
        },
      },
      emoji: {name: '👍'},
      message: {
        id: 'abc123',
        reactions: {
          cache: [],
        },
      },
    } as any;

    const USER: User | PartialUser = {bot: false, id: '123'} as any;

    const DB_ENTRY = {
      addressToFund: ETH_ADDRESS_FIXTURE,
      amountUSDC: 50000,
      channelID: '886976610018934824',
      createdAt: new Date(0),
      guildID: GUILD_ID_FIXTURE,
      id: 1,
      messageID: 'abc123',
      processed: false,
      purpose: 'XYZ Seed Round',
      upvoteCount: 2,
      uuid: 'abc123def456',
      voteThreshold: 3,
    };

    const getDaoConfigs = await import(
      '../../../../services/discordConfig/getDaoDiscordConfigs'
    );

    const getDaoConfigsSpy = jest
      .spyOn(getDaoConfigs, 'getDaoDiscordConfigs')
      .mockImplementationOnce(async () => FAKE_DAOS_FIXTURE);

    /**
     * Mock db return value
     *
     * @todo fix types
     */
    const dbFindSpy = (
      prismaMock.fundAddressPoll as any
    ).findUnique.mockResolvedValue(DB_ENTRY);

    /**
     * Mock db update
     *
     * @todo fix types
     */
    const dbUpdateSpy = (
      prismaMock.fundAddressPoll as any
    ).update.mockImplementation(async () => {});

    const BUY_BUTTON = new MessageActionRow().addComponents(
      new MessageButton()
        .setLabel('Fund')
        .setStyle('LINK')
        .setURL(
          `${FUND_EXTERNAL_URL}/?daoName=test&amount=${DB_ENTRY.amountUSDC}&id=${DB_ENTRY.uuid}`
        )
        .setEmoji('💸')
    );

    await fundPollReactionHandler({reaction: REACTION, user: USER});

    expect(dbFindSpy).toHaveBeenCalledTimes(1);
    expect(dbFindSpy).toHaveBeenCalledWith({where: {messageID: 'abc123'}});
    expect(dbUpdateSpy).toHaveBeenCalledTimes(3);

    expect(dbUpdateSpy.mock.calls[0][0]).toEqual({
      data: {upvoteCount: 3},
      where: {messageID: 'abc123'},
    });

    expect(dbUpdateSpy.mock.calls[1][0]).toEqual({
      data: {processed: true},
      where: {messageID: 'abc123'},
    });

    expect(dbUpdateSpy.mock.calls[2][0]).toEqual({
      data: {actionMessageID: 'xyz456'},
      where: {messageID: 'abc123'},
    });

    // Assert result was posted in the result channel

    expect(channelSendSpy).toHaveBeenCalledTimes(1);

    expect(channelSendSpy.mock.calls[0][0].content).toMatch(
      /The poll for "\*XYZ Seed Round\*" ended <t:\d+:R>\. The threshold of 3 votes has been reached\./i
    );

    expect(channelSendSpy.mock.calls[0][0].components).toEqual([BUY_BUTTON]);

    // Assert result was posted in the poll's channel

    expect(messageReplySpy).toHaveBeenCalledTimes(1);
    expect(messageReplySpy.mock.calls[0][0].embeds[0].title).toMatch(/fund/i);

    expect(messageReplySpy.mock.calls[0][0].embeds[0].url).toBe(
      FUND_EXTERNAL_URL
    );

    expect(messageReplySpy.mock.calls[0][0].embeds[0].description).toMatch(
      /The poll for "\*XYZ Seed Round\*" ended <t:\d+:R>\. The threshold of 3 votes has been reached\./i
    );

    // Cleanup

    dbFindSpy.mockRestore();
    dbUpdateSpy.mockRestore();
    getDaoConfigsSpy.mockRestore();
  });

  test('should exit with no error if dao cannot be found', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation((m) => m);

    const channelSendSpy = jest.fn().mockImplementation(async () => ({}));

    const REACTION: MessageReaction | PartialMessageReaction = {
      emoji: {name: '👍'},
      message: {
        id: 'abc123',
        reactions: {
          cache: [],
        },
      },
    } as any;

    const USER: User | PartialUser = {bot: false, id: '123'} as any;

    const DB_ENTRY = {
      addressToFund: ETH_ADDRESS_FIXTURE,
      amountUSDC: 50000,
      channelID: '886976610018934824',
      createdAt: new Date(0),
      guildID: GUILD_ID_FIXTURE,
      id: 1,
      messageID: 'abc123',
      processed: false,
      purpose: 'XYZ Seed Round',
      upvoteCount: 2,
      uuid: 'abc123def456',
      voteThreshold: 3,
    };

    const getDaoConfigs = await import(
      '../../../../services/discordConfig/getDaoDiscordConfigs'
    );

    const getDaoConfigsSpy = jest
      .spyOn(getDaoConfigs, 'getDaoDiscordConfigs')
      .mockImplementationOnce(async () => undefined);

    /**
     * Mock db return value
     *
     * @todo fix types
     */
    const dbFindSpy = (
      prismaMock.fundAddressPoll as any
    ).findUnique.mockResolvedValue(DB_ENTRY);

    /**
     * Mock db update
     *
     * @todo fix types
     */
    const dbUpdateSpy = (
      prismaMock.fundAddressPoll as any
    ).update.mockImplementation(async () => {});

    await fundPollReactionHandler({reaction: REACTION, user: USER});

    // Assert `console.error` was called

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    expect(consoleErrorSpy.mock.calls[0][0]).toMatch(
      /Something went wrong while handling the Discord reaction: Error: Could not find DAO by 'guildID' 123123123123123123/i
    );

    // Assert nothing else was called

    expect(channelSendSpy).toHaveBeenCalledTimes(0);

    // Cleanup

    dbFindSpy.mockRestore();
    dbUpdateSpy.mockRestore();
    getDaoConfigsSpy.mockRestore();
  });

  test('should exit with no error if result channel ID cannot be found', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation((m) => m);

    const channelSendSpy = jest.fn().mockImplementation(async () => ({}));

    const REACTION: MessageReaction | PartialMessageReaction = {
      emoji: {name: '👍'},
      message: {
        id: 'abc123',
        reactions: {
          cache: [],
        },
      },
    } as any;

    const USER: User | PartialUser = {bot: false, id: '123'} as any;

    const DB_ENTRY = {
      addressToFund: ETH_ADDRESS_FIXTURE,
      amountUSDC: 50000,
      channelID: '886976610018934824',
      createdAt: new Date(0),
      guildID: GUILD_ID_FIXTURE,
      id: 1,
      messageID: 'abc123',
      processed: false,
      purpose: 'XYZ Seed Round',
      upvoteCount: 2,
      uuid: 'abc123def456',
      voteThreshold: 3,
    };

    const getDaoConfigs = await import(
      '../../../../services/discordConfig/getDaoDiscordConfigs'
    );

    const getDaoConfigsSpy = jest
      .spyOn(getDaoConfigs, 'getDaoDiscordConfigs')
      .mockImplementationOnce(async () => ({
        ...FAKE_DAOS_FIXTURE,
        test: {...FAKE_DAOS_FIXTURE.test, applications: {}},
      }));

    /**
     * Mock db return value
     *
     * @todo fix types
     */
    const dbFindSpy = (
      prismaMock.fundAddressPoll as any
    ).findUnique.mockResolvedValue(DB_ENTRY);

    /**
     * Mock db update
     *
     * @todo fix types
     */
    const dbUpdateSpy = (
      prismaMock.fundAddressPoll as any
    ).update.mockImplementation(async () => {});

    await fundPollReactionHandler({reaction: REACTION, user: USER});

    // Assert `console.error` was called

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    expect(consoleErrorSpy.mock.calls[0][0]).toMatch(
      /Something went wrong while handling the Discord reaction: Error: Could not find a `resultChannelID`\./i
    );

    // Assert nothing else was called

    expect(channelSendSpy).toHaveBeenCalledTimes(0);

    // Cleanup

    dbFindSpy.mockRestore();
    dbUpdateSpy.mockRestore();
    getDaoConfigsSpy.mockRestore();
  });

  test('should exit with no error if `user` is a bot', () => {
    const REACTION: MessageReaction | PartialMessageReaction = {
      emoji: {name: '👍'},
      message: {
        id: 'abc123',
      },
      partial: false,
    } as any;

    const USER: User | PartialUser = {bot: true, id: '123'} as any;

    fundPollReactionHandler({reaction: REACTION, user: USER});
  });

  test('should exit with no error if error finding db entry', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation((m) => m);

    const REACTION: MessageReaction | PartialMessageReaction = {
      emoji: {name: '👍'},
      message: {
        id: 'abc123',
        reactions: {
          cache: [
            {
              emoji: {name: '👍'},
              users: {
                cache: new Map().set('123', 'test'),
              },
            },
          ],
        },
      },
    } as any;

    const USER: User | PartialUser = {bot: false, id: '123'} as any;

    /**
     * Mock db error
     *
     * @todo fix types
     */
    const dbSpy = (
      prismaMock.fundAddressPoll as any
    ).findUnique.mockImplementation(() => {
      throw new Error('Some bad error');
    });

    await fundPollReactionHandler({reaction: REACTION, user: USER});

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy.mock.calls[0][0]).toMatch(ERROR_REGEXP);

    // Cleanup

    consoleErrorSpy.mockRestore();
    dbSpy.mockRestore();
  });

  test('should exit with no error if error on remove reaction', async () => {
    const userReactionRemoveSpy = jest.fn().mockImplementation(() => {
      throw new Error('Some bad error');
    });

    const userSendSpy = jest.fn();

    const REACTION: MessageReaction | PartialMessageReaction = {
      emoji: {name: '👍'},
      message: {
        id: 'abc123',
      },
      partial: false,
      users: {
        remove: userReactionRemoveSpy,
      },
    } as any;

    const USER: User | PartialUser = {
      bot: false,
      discriminator: '1234',
      id: '123',
      send: userSendSpy,
      username: 'testuser',
    } as any;

    const DB_ENTRY = {
      addressToFund: ETH_ADDRESS_FIXTURE,
      amountUSDC: 50000,
      channelID: '886976610018934824',
      createdAt: new Date(0),
      guildID: GUILD_ID_FIXTURE,
      id: 1,
      messageID: 'abc123',
      processed: true,
      purpose: 'XYZ Seed Round',
      upvoteCount: 1,
      uuid: 'abc123def456',
      voteThreshold: 3,
    };

    const getDaoConfigs = await import(
      '../../../../services/discordConfig/getDaoDiscordConfigs'
    );

    const getDaoConfigsSpy = jest
      .spyOn(getDaoConfigs, 'getDaoDiscordConfigs')
      .mockImplementationOnce(async () => FAKE_DAOS_FIXTURE);

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation((m) => m);

    /**
     * Mock db return value
     *
     * @todo fix types
     */
    const dbSpy = (
      prismaMock.fundAddressPoll as any
    ).findUnique.mockResolvedValue(DB_ENTRY);

    await fundPollReactionHandler({reaction: REACTION, user: USER});

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    expect(consoleErrorSpy.mock.calls[0][0]?.message).toMatch(
      /some bad error/i
    );

    // Assert did not exit function early

    expect(dbSpy).toHaveBeenCalledTimes(1);
    expect(dbSpy).toHaveBeenCalledWith({where: {messageID: 'abc123'}});
    expect(getDaoConfigsSpy).toHaveBeenCalledTimes(1);
    expect(userReactionRemoveSpy).toHaveBeenCalledTimes(1);
    expect(userReactionRemoveSpy).toHaveBeenCalledWith('123');
    expect(userSendSpy).toHaveBeenCalledTimes(1);

    expect(userSendSpy.mock.calls[0][0]).toMatch(
      /The poll has ended for \*XYZ Seed Round\*, because the number of required upvotes has been reached\. To purchase, go to <#123123123123123123>\./i
    );

    // Cleanup

    consoleErrorSpy.mockRestore();
    dbSpy.mockRestore();
    getDaoConfigsSpy.mockRestore();
    userReactionRemoveSpy.mockRestore();
    userSendSpy.mockRestore();
  });

  test('should exit with no error if error on DM-ing user', async () => {
    const userReactionRemoveSpy = jest.fn();

    const userSendSpy = jest.fn().mockImplementation(() => {
      throw new Error('Some bad error');
    });

    const REACTION: MessageReaction | PartialMessageReaction = {
      emoji: {name: '👍'},
      message: {
        id: 'abc123',
      },
      partial: false,
      users: {
        remove: userReactionRemoveSpy,
      },
    } as any;

    const USER: User | PartialUser = {
      bot: false,
      discriminator: '1234',
      id: '123',
      send: userSendSpy,
      username: 'testuser',
    } as any;

    const DB_ENTRY = {
      addressToFund: ETH_ADDRESS_FIXTURE,
      amountUSDC: 50000,
      channelID: '886976610018934824',
      createdAt: new Date(0),
      guildID: GUILD_ID_FIXTURE,
      id: 1,
      messageID: 'abc123',
      processed: true,
      purpose: 'XYZ Seed Round',
      upvoteCount: 1,
      uuid: 'abc123def456',
      voteThreshold: 3,
    };

    const getDaoConfigs = await import(
      '../../../../services/discordConfig/getDaoDiscordConfigs'
    );

    const getDaoConfigsSpy = jest
      .spyOn(getDaoConfigs, 'getDaoDiscordConfigs')
      .mockImplementationOnce(async () => FAKE_DAOS_FIXTURE);

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation((m) => m);

    /**
     * Mock db return value
     *
     * @todo fix types
     */
    const dbSpy = (
      prismaMock.fundAddressPoll as any
    ).findUnique.mockResolvedValue(DB_ENTRY);

    await fundPollReactionHandler({reaction: REACTION, user: USER});

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy.mock.calls[0][0]).toMatch(ERROR_REGEXP);
    expect(dbSpy).toHaveBeenCalledTimes(1);
    expect(dbSpy).toHaveBeenCalledWith({where: {messageID: 'abc123'}});
    expect(getDaoConfigsSpy).toHaveBeenCalledTimes(1);
    expect(userReactionRemoveSpy).toHaveBeenCalledTimes(1);
    expect(userReactionRemoveSpy).toHaveBeenCalledWith('123');
    expect(userSendSpy).toHaveBeenCalledTimes(1);

    expect(userSendSpy.mock.calls[0][0]).toMatch(
      /The poll has ended for \*XYZ Seed Round\*, because the number of required upvotes has been reached\. To purchase, go to <#123123123123123123>\./i
    );

    // Cleanup

    consoleErrorSpy.mockRestore();
    dbSpy.mockRestore();
    getDaoConfigsSpy.mockRestore();
    userReactionRemoveSpy.mockRestore();
    userSendSpy.mockRestore();
  });

  test('should remove invalid reaction', async () => {
    const userReactionRemoveSpy = jest.fn();

    const REACTION: MessageReaction | PartialMessageReaction = {
      // Invalid emoji option
      emoji: {name: '🤑'},
      message: {
        id: 'abc123',
      },
      partial: false,
      users: {
        remove: userReactionRemoveSpy,
      },
    } as any;

    const USER: User | PartialUser = {bot: false, id: '123'} as any;

    const DB_ENTRY = {
      addressToFund: ETH_ADDRESS_FIXTURE,
      amountUSDC: 50000,
      channelID: '886976610018934824',
      createdAt: new Date(0),
      guildID: GUILD_ID_FIXTURE,
      id: 1,
      messageID: 'abc123',
      processed: false,
      purpose: 'XYZ Seed Round',
      upvoteCount: 1,
      uuid: 'abc123def456',
      voteThreshold: 3,
    };

    /**
     * Mock db return value
     *
     * @todo fix types
     */
    const dbSpy = (
      prismaMock.fundAddressPoll as any
    ).findUnique.mockResolvedValue(DB_ENTRY);

    await fundPollReactionHandler({reaction: REACTION, user: USER});

    expect(dbSpy).toHaveBeenCalledTimes(1);
    expect(dbSpy).toHaveBeenCalledWith({where: {messageID: 'abc123'}});
    expect(userReactionRemoveSpy).toHaveBeenCalledTimes(1);
    expect(userReactionRemoveSpy).toHaveBeenCalledWith('123');

    // Cleanup

    dbSpy.mockRestore();
    userReactionRemoveSpy.mockRestore();
  });

  test('should remove reaction and send user a message if poll has ended', async () => {
    const userReactionRemoveSpy = jest.fn();
    const userSendSpy = jest.fn();

    const REACTION: MessageReaction | PartialMessageReaction = {
      emoji: {name: '👍'},
      message: {
        id: 'abc123',
      },
      partial: false,
      users: {
        remove: userReactionRemoveSpy,
      },
    } as any;

    const USER: User | PartialUser = {
      bot: false,
      id: '123',
      send: userSendSpy,
    } as any;

    const DB_ENTRY = {
      addressToFund: ETH_ADDRESS_FIXTURE,
      amountUSDC: 50000,
      channelID: '886976610018934824',
      createdAt: new Date(0),
      guildID: GUILD_ID_FIXTURE,
      id: 1,
      messageID: 'abc123',
      processed: true,
      purpose: 'XYZ Seed Round',
      upvoteCount: 1,
      uuid: 'abc123def456',
      voteThreshold: 3,
    };

    const getDaoConfigs = await import(
      '../../../../services/discordConfig/getDaoDiscordConfigs'
    );

    const getDaoConfigsSpy = jest
      .spyOn(getDaoConfigs, 'getDaoDiscordConfigs')
      .mockImplementationOnce(async () => FAKE_DAOS_FIXTURE);

    /**
     * Mock db return value
     *
     * @todo fix types
     */
    const dbSpy = (
      prismaMock.fundAddressPoll as any
    ).findUnique.mockResolvedValue(DB_ENTRY);

    await fundPollReactionHandler({reaction: REACTION, user: USER});

    expect(dbSpy).toHaveBeenCalledTimes(1);
    expect(dbSpy).toHaveBeenCalledWith({where: {messageID: 'abc123'}});
    expect(getDaoConfigsSpy).toHaveBeenCalledTimes(1);
    expect(userReactionRemoveSpy).toHaveBeenCalledTimes(1);
    expect(userReactionRemoveSpy).toHaveBeenCalledWith('123');
    expect(userSendSpy).toHaveBeenCalledTimes(1);

    expect(userSendSpy.mock.calls[0][0]).toMatch(
      /The poll has ended for \*XYZ Seed Round\*, because the number of required upvotes has been reached\. To purchase, go to <#123123123123123123>\./i
    );

    // Cleanup

    dbSpy.mockRestore();
    getDaoConfigsSpy.mockRestore();
    userReactionRemoveSpy.mockRestore();
    userSendSpy.mockRestore();
  });

  test("should only take user's latest reaction", async () => {
    const userReactionRemoveSpy = jest.fn();

    const REACTION: MessageReaction | PartialMessageReaction = {
      // New reaction
      emoji: {name: '👍'},
      message: {
        id: 'abc123',
        reactions: {
          cache: [
            {
              // Old reaction
              emoji: {name: '👎'},
              users: {
                cache: new Map().set('123', 'test'),
                remove: userReactionRemoveSpy,
              },
            },
          ],
        },
      },
      partial: false,
    } as any;

    const USER: User | PartialUser = {
      bot: false,
      id: '123',
    } as any;

    const DB_ENTRY = {
      addressToFund: ETH_ADDRESS_FIXTURE,
      amountUSDC: 50000,
      channelID: '886976610018934824',
      createdAt: new Date(0),
      guildID: GUILD_ID_FIXTURE,
      id: 1,
      messageID: 'abc123',
      processed: false,
      purpose: 'XYZ Seed Round',
      upvoteCount: 1,
      uuid: 'abc123def456',
      voteThreshold: 3,
    };

    /**
     * Mock db return value
     *
     * @todo fix types
     */
    const dbSpy = (
      prismaMock.fundAddressPoll as any
    ).findUnique.mockResolvedValue(DB_ENTRY);

    await fundPollReactionHandler({reaction: REACTION, user: USER});

    expect(dbSpy).toHaveBeenCalledTimes(1);
    expect(dbSpy).toHaveBeenCalledWith({where: {messageID: 'abc123'}});
    expect(userReactionRemoveSpy).toHaveBeenCalledTimes(1);
    expect(userReactionRemoveSpy).toHaveBeenCalledWith('123');

    // Cleanup

    dbSpy.mockRestore();
    userReactionRemoveSpy.mockRestore();
  });

  test('should fetch data if reaction is `partial: true`', async () => {
    const reactionFetchSpy = jest.fn();
    const reactionUsersFetchSpy = jest.fn();

    const REACTION: MessageReaction | PartialMessageReaction = {
      emoji: {name: '👍'},
      fetch: reactionFetchSpy,
      message: {
        id: 'abc123',
        reactions: {
          cache: [
            {
              emoji: {name: '👍'},
              users: {
                cache: new Map().set('123', 'test'),
                fetch: reactionUsersFetchSpy,
              },
            },
          ],
        },
      },
      partial: true,
    } as any;

    const USER: User | PartialUser = {bot: false, id: '123'} as any;

    const DB_ENTRY = {
      addressToFund: ETH_ADDRESS_FIXTURE,
      amountUSDC: 50000,
      channelID: '886976610018934824',
      createdAt: new Date(0),
      guildID: GUILD_ID_FIXTURE,
      id: 1,
      messageID: 'abc123',
      processed: false,
      purpose: 'XYZ Seed Round',
      upvoteCount: 1,
      uuid: 'abc123def456',
      voteThreshold: 3,
    };

    /**
     * Mock db return value
     *
     * @todo fix types
     */
    const dbSpy = (
      prismaMock.fundAddressPoll as any
    ).findUnique.mockResolvedValue(DB_ENTRY);

    await fundPollReactionHandler({reaction: REACTION, user: USER});

    expect(reactionFetchSpy).toHaveBeenCalledTimes(1);
    expect(reactionUsersFetchSpy).toHaveBeenCalledTimes(1);

    // Cleanup

    dbSpy.mockRestore();
    reactionFetchSpy.mockRestore();
    reactionUsersFetchSpy.mockRestore();
  });
});
