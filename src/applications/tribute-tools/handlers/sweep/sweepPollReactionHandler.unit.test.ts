import {
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
import {prismaMock} from '../../../../../test/prismaMock';
import {sweepPollReactionHandler} from '.';

describe('sweepPollReactionHandler unit tests', () => {
  const ERROR_REGEXP =
    /Something went wrong while handling the Discord reaction: Error: Some bad error/i;

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

    /**
     * Mock db return value
     *
     * @todo fix types
     */
    const dbSpy = (
      prismaMock.floorSweeperPoll as any
    ).findUnique.mockResolvedValue(DB_ENTRY);

    await sweepPollReactionHandler({reaction: REACTION, user: USER});

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
      emoji: {name: '🇦'},
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
      channelID: '886976610018934824',
      contractAddress: ETH_ADDRESS_FIXTURE,
      createdAt: new Date(0),
      dateEnd: new Date(10),
      guildID: GUILD_ID_FIXTURE,
      id: 1,
      messageID: '123456789',
      options: {'🇦': 50, '🇧': 100, '🇨': 150, '🚫': 'None'},
      processed: true,
      question: 'How much to sweep larvalads fam?',
      result: 100,
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
      prismaMock.floorSweeperPoll as any
    ).findUnique.mockResolvedValue(DB_ENTRY);

    await sweepPollReactionHandler({reaction: REACTION, user: USER});

    expect(dbSpy).toHaveBeenCalledTimes(1);
    expect(dbSpy).toHaveBeenCalledWith({where: {messageID: 'abc123'}});
    expect(getDaoConfigsSpy).toHaveBeenCalledTimes(1);
    expect(userReactionRemoveSpy).toHaveBeenCalledTimes(1);
    expect(userReactionRemoveSpy).toHaveBeenCalledWith('123');
    expect(userSendSpy).toHaveBeenCalledTimes(1);

    expect(userSendSpy.mock.calls[0][0]).toMatch(
      /The poll has ended for \*How much to sweep larvalads fam\?\*\. The result was \*\*100 ETH\*\*\. To sweep, go to <#123123123123123123>\./i
    );

    // Cleanup

    dbSpy.mockRestore();
    getDaoConfigsSpy.mockRestore();
    userReactionRemoveSpy.mockRestore();
    userSendSpy.mockRestore();
  });

  test('should remove reaction and send user a message if poll has ended and result is `None`', async () => {
    const userReactionRemoveSpy = jest.fn();
    const userSendSpy = jest.fn();

    const REACTION: MessageReaction | PartialMessageReaction = {
      emoji: {name: '🇦'},
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
      channelID: '886976610018934824',
      contractAddress: ETH_ADDRESS_FIXTURE,
      createdAt: new Date(0),
      dateEnd: new Date(10),
      guildID: GUILD_ID_FIXTURE,
      id: 1,
      messageID: '123456789',
      options: {'🇦': 50, '🇧': 100, '🇨': 150, '🚫': 'None'},
      processed: true,
      question: 'How much to sweep larvalads fam?',
      result: 0,
    };

    /**
     * Mock db return value
     *
     * @todo fix types
     */
    const dbSpy = (
      prismaMock.floorSweeperPoll as any
    ).findUnique.mockResolvedValue(DB_ENTRY);

    await sweepPollReactionHandler({reaction: REACTION, user: USER});

    expect(dbSpy).toHaveBeenCalledTimes(1);
    expect(dbSpy).toHaveBeenCalledWith({where: {messageID: 'abc123'}});
    expect(userReactionRemoveSpy).toHaveBeenCalledTimes(1);
    expect(userReactionRemoveSpy).toHaveBeenCalledWith('123');
    expect(userSendSpy).toHaveBeenCalledTimes(1);

    expect(userSendSpy.mock.calls[0][0]).toMatch(
      /The poll has ended for \*How much to sweep larvalads fam\?\*\. The result was \*\*None\*\*\./i
    );

    // Cleanup

    dbSpy.mockRestore();
    userReactionRemoveSpy.mockRestore();
    userSendSpy.mockRestore();
  });

  test('should remove reaction and send user a message if poll has ended and result is not yet processed', async () => {
    const userReactionRemoveSpy = jest.fn();
    const userSendSpy = jest.fn();

    const REACTION: MessageReaction | PartialMessageReaction = {
      emoji: {name: '🇦'},
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

    /**
     * Mock db return value
     *
     * @todo fix types
     */
    const dbSpy = (
      prismaMock.floorSweeperPoll as any
    ).findUnique.mockResolvedValue(DB_ENTRY);

    await sweepPollReactionHandler({reaction: REACTION, user: USER});

    expect(dbSpy).toHaveBeenCalledTimes(1);
    expect(dbSpy).toHaveBeenCalledWith({where: {messageID: 'abc123'}});
    expect(userReactionRemoveSpy).toHaveBeenCalledTimes(1);
    expect(userReactionRemoveSpy).toHaveBeenCalledWith('123');
    expect(userSendSpy).toHaveBeenCalledTimes(1);

    expect(userSendSpy.mock.calls[0][0]).toMatch(
      /The poll has ended for \*How much to sweep larvalads fam\?\*\. The result has not yet been processed\./i
    );

    // Cleanup

    dbSpy.mockRestore();
    userReactionRemoveSpy.mockRestore();
    userSendSpy.mockRestore();
  });

  test("should only take user's latest reaction", async () => {
    const userReactionRemoveSpy = jest.fn();

    const REACTION: MessageReaction | PartialMessageReaction = {
      emoji: {name: '🇨'},
      message: {
        id: 'abc123',
        reactions: {
          cache: [
            {
              emoji: {name: '🇦'},
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
      channelID: '886976610018934824',
      contractAddress: ETH_ADDRESS_FIXTURE,
      createdAt: new Date(0),
      dateEnd: new Date(Date.now() + 10000000),
      guildID: GUILD_ID_FIXTURE,
      id: 1,
      messageID: '123456789',
      options: {'🇦': 50, '🇧': 100, '🇨': 150, '🚫': 'None'},
      processed: false,
      question: 'How much to sweep larvalads fam?',
      result: 100,
    };

    /**
     * Mock db return value
     *
     * @todo fix types
     */
    const dbSpy = (
      prismaMock.floorSweeperPoll as any
    ).findUnique.mockResolvedValue(DB_ENTRY);

    await sweepPollReactionHandler({reaction: REACTION, user: USER});

    expect(dbSpy).toHaveBeenCalledTimes(1);
    expect(dbSpy).toHaveBeenCalledWith({where: {messageID: 'abc123'}});
    expect(userReactionRemoveSpy).toHaveBeenCalledTimes(1);
    expect(userReactionRemoveSpy).toHaveBeenCalledWith('123');

    // Cleanup

    dbSpy.mockRestore();
    userReactionRemoveSpy.mockRestore();
  });

  test('should exit with no error if error finding db entry', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation((m) => m);

    const REACTION: MessageReaction | PartialMessageReaction = {
      emoji: {name: '🇦'},
      message: {
        id: 'abc123',
      },
    } as any;

    const USER: User | PartialUser = {bot: false, id: '123'} as any;

    /**
     * Mock db error
     *
     * @todo fix types
     */
    const dbSpy = (
      prismaMock.floorSweeperPoll as any
    ).findUnique.mockImplementation(() => {
      throw new Error('Some bad error');
    });

    await sweepPollReactionHandler({reaction: REACTION, user: USER});

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
      emoji: {name: '🇨'},
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
      channelID: '886976610018934824',
      contractAddress: ETH_ADDRESS_FIXTURE,
      createdAt: new Date(0),
      dateEnd: new Date(Date.now() - 10000000),
      guildID: GUILD_ID_FIXTURE,
      id: 1,
      messageID: '123456789',
      options: {'🇦': 50, '🇧': 100, '🇨': 150, '🚫': 'None'},
      processed: false,
      question: 'How much to sweep larvalads fam?',
      result: 100,
      uuid: 'abc123def456',
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
      prismaMock.floorSweeperPoll as any
    ).findUnique.mockResolvedValue(DB_ENTRY);

    await sweepPollReactionHandler({reaction: REACTION, user: USER});

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    expect(consoleErrorSpy.mock.calls[0][0]).toMatch(
      /There was an error while removing the user\'s \(testuser#1234\) last reaction for Floor Sweeper Poll abc123def456\./i
    );

    // Assert did not exit function early

    expect(dbSpy).toHaveBeenCalledTimes(1);
    expect(dbSpy).toHaveBeenCalledWith({where: {messageID: 'abc123'}});
    expect(getDaoConfigsSpy).toHaveBeenCalledTimes(1);
    expect(userReactionRemoveSpy).toHaveBeenCalledTimes(1);
    expect(userReactionRemoveSpy).toHaveBeenCalledWith('123');
    expect(userSendSpy).toHaveBeenCalledTimes(1);

    expect(userSendSpy.mock.calls[0][0]).toMatch(
      /The poll has ended for \*How much to sweep larvalads fam\?\*\. The result was \*\*None\*\*\./i
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
      emoji: {name: '🇨'},
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
      channelID: '886976610018934824',
      contractAddress: ETH_ADDRESS_FIXTURE,
      createdAt: new Date(0),
      dateEnd: new Date(Date.now() - 10000000),
      guildID: GUILD_ID_FIXTURE,
      id: 1,
      messageID: '123456789',
      options: {'🇦': 50, '🇧': 100, '🇨': 150, '🚫': 'None'},
      processed: false,
      question: 'How much to sweep larvalads fam?',
      result: 100,
      uuid: 'abc123def456',
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
      prismaMock.floorSweeperPoll as any
    ).findUnique.mockResolvedValue(DB_ENTRY);

    await sweepPollReactionHandler({reaction: REACTION, user: USER});

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy.mock.calls[0][0]).toMatch(ERROR_REGEXP);
    expect(dbSpy).toHaveBeenCalledTimes(1);
    expect(dbSpy).toHaveBeenCalledWith({where: {messageID: 'abc123'}});
    expect(getDaoConfigsSpy).toHaveBeenCalledTimes(1);
    expect(userReactionRemoveSpy).toHaveBeenCalledTimes(1);
    expect(userReactionRemoveSpy).toHaveBeenCalledWith('123');
    expect(userSendSpy).toHaveBeenCalledTimes(1);

    expect(userSendSpy.mock.calls[0][0]).toMatch(
      /The poll has ended for \*How much to sweep larvalads fam\?\*\. The result was \*\*None\*\*\./i
    );

    // Cleanup

    consoleErrorSpy.mockRestore();
    dbSpy.mockRestore();
    getDaoConfigsSpy.mockRestore();
    userReactionRemoveSpy.mockRestore();
    userSendSpy.mockRestore();
  });

  test('should fetch data if reaction is `partial: true`', async () => {
    const reactionFetchSpy = jest.fn();
    const reactionUsersFetchSpy = jest.fn();

    const REACTION: MessageReaction | PartialMessageReaction = {
      emoji: {name: '🇦'},
      fetch: reactionFetchSpy,
      message: {
        id: 'abc123',
        reactions: {
          cache: [
            {
              emoji: {name: '🇦'},
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
      channelID: '886976610018934824',
      contractAddress: ETH_ADDRESS_FIXTURE,
      createdAt: new Date(0),
      dateEnd: new Date(Date.now() + 10000000),
      guildID: GUILD_ID_FIXTURE,
      id: 1,
      messageID: '123456789',
      options: {'🇦': 50, '🇧': 100, '🇨': 150, '🚫': 'None'},
      processed: false,
      question: 'How much to sweep larvalads fam?',
      result: 0,
    };

    /**
     * Mock db return value
     *
     * @todo fix types
     */
    const dbSpy = (
      prismaMock.floorSweeperPoll as any
    ).findUnique.mockResolvedValue(DB_ENTRY);

    await sweepPollReactionHandler({reaction: REACTION, user: USER});

    expect(reactionFetchSpy).toHaveBeenCalledTimes(1);
    expect(reactionUsersFetchSpy).toHaveBeenCalledTimes(1);

    // Cleanup

    dbSpy.mockRestore();
    reactionFetchSpy.mockRestore();
    reactionUsersFetchSpy.mockRestore();
  });
});
