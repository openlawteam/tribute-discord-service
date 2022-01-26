import {
  Collection,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from 'discord.js';

import {
  ETH_ADDRESS_FIXTURE,
  FAKE_DAOS_FIXTURE,
  GUILD_ID_FIXTURE,
} from '../../../../test';
import {pollReactionHandler} from '.';
import {prismaMock} from '../../../../test/prismaMock';

describe('pollReactionHandler unit tests', () => {
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

    await pollReactionHandler(REACTION, USER);

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

    const getDaos = await import('../../../services/dao/getDaos');

    const getDaosSpy = jest
      .spyOn(getDaos, 'getDaos')
      .mockImplementationOnce(async () => FAKE_DAOS_FIXTURE);

    /**
     * Mock db return value
     *
     * @todo fix types
     */
    const dbSpy = (
      prismaMock.floorSweeperPoll as any
    ).findUnique.mockResolvedValue(DB_ENTRY);

    await pollReactionHandler(REACTION, USER);

    expect(dbSpy).toHaveBeenCalledTimes(1);
    expect(dbSpy).toHaveBeenCalledWith({where: {messageID: 'abc123'}});
    expect(getDaosSpy).toHaveBeenCalledTimes(1);
    expect(userReactionRemoveSpy).toHaveBeenCalledTimes(1);
    expect(userReactionRemoveSpy).toHaveBeenCalledWith('123');
    expect(userSendSpy).toHaveBeenCalledTimes(1);

    expect(userSendSpy.mock.calls[0][0]).toMatch(
      /The poll has ended for \*How much to sweep larvalads fam\?\*\. The result was \*\*100 ETH\*\*\. To sweep, go to <#123123123123123123>\./i
    );

    // Cleanup

    dbSpy.mockRestore();
    getDaosSpy.mockRestore();
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

    await pollReactionHandler(REACTION, USER);

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

    await pollReactionHandler(REACTION, USER);

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

    await pollReactionHandler(REACTION, USER);

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

    await pollReactionHandler(REACTION, USER);

    expect(reactionFetchSpy).toHaveBeenCalledTimes(1);
    expect(reactionUsersFetchSpy).toHaveBeenCalledTimes(1);

    // Cleanup

    dbSpy.mockRestore();
    reactionFetchSpy.mockRestore();
    reactionUsersFetchSpy.mockRestore();
  });
});
