import {
  MessageReaction,
  PartialMessageReaction,
  User,
  PartialUser,
} from 'discord.js';

import {
  ETH_ADDRESS_FIXTURE,
  FAKE_DAOS_FIXTURE,
  GUILD_ID_FIXTURE,
} from '../../../../../test';
import {buyPollReactionHandler} from './buyPollReactionHandler';
import {prismaMock} from '../../../../../test/prismaMock';

describe('buyPollReactionHandler unit tests', () => {
  test.skip('should increment upvotes on upvote, if `processed: false`', () => {});

  test('should exit with no error if `user` is a bot', () => {
    const REACTION: MessageReaction | PartialMessageReaction = {
      emoji: {name: '👍'},
      message: {
        id: 'abc123',
      },
      partial: false,
    } as any;

    const USER: User | PartialUser = {bot: true, id: '123'} as any;

    buyPollReactionHandler({reaction: REACTION, user: USER});
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

    const DB_ENTRY = undefined;

    /**
     * Mock db error
     *
     * @todo fix types
     */
    const dbSpy = (prismaMock.buyNFTPoll as any).findUnique.mockImplementation(
      () => {
        throw new Error('Some bad error');
      }
    );

    let e: Error | undefined = undefined;

    try {
      await buyPollReactionHandler({reaction: REACTION, user: USER});
    } catch (error) {
      e = error as Error;
    }

    expect(e).toBe(undefined);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    expect(consoleErrorSpy.mock.calls[0][0]).toMatch(
      /Something went wrong while finding `messageID` abc123: Error: Some bad error/i
    );

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
      channelID: '886976610018934824',
      contractAddress: ETH_ADDRESS_FIXTURE,
      createdAt: new Date(0),
      guildID: GUILD_ID_FIXTURE,
      id: 1,
      messageID: '123456789',
      name: 'Test Punk #123',
      processed: true,
      tokenID: '123',
      upvoteCount: 2,
      uuid: 'abc123def456',
      voteThreshold: 5,
    };

    const getDaos = await import('../../../../services/dao/getDaos');

    const getDaosSpy = jest
      .spyOn(getDaos, 'getDaos')
      .mockImplementationOnce(async () => FAKE_DAOS_FIXTURE);

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation((m) => m);

    /**
     * Mock db return value
     *
     * @todo fix types
     */
    const dbSpy = (prismaMock.buyNFTPoll as any).findUnique.mockResolvedValue(
      DB_ENTRY
    );

    let e: Error | undefined = undefined;

    try {
      await buyPollReactionHandler({reaction: REACTION, user: USER});
    } catch (error) {
      e = error as Error;
    }

    // Assert no error thrown

    expect(e).toBe(undefined);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    expect(consoleErrorSpy.mock.calls[0][0]).toMatch(
      /There was an error while removing the user\'s \(testuser#1234\) last reaction for `buy_nft_poll` abc123def456\./i
    );

    // Assert did not exit function early

    expect(dbSpy).toHaveBeenCalledTimes(1);
    expect(dbSpy).toHaveBeenCalledWith({where: {messageID: 'abc123'}});
    expect(getDaosSpy).toHaveBeenCalledTimes(1);
    expect(userReactionRemoveSpy).toHaveBeenCalledTimes(1);
    expect(userReactionRemoveSpy).toHaveBeenCalledWith('123');
    expect(userSendSpy).toHaveBeenCalledTimes(1);

    expect(userSendSpy.mock.calls[0][0]).toMatch(
      /The poll has ended for \*Test Punk #123\*, because the number of required upvotes has been reached\. To purchase, go to <#123123123123123123>\./i
    );

    // Cleanup

    consoleErrorSpy.mockRestore();
    dbSpy.mockRestore();
    getDaosSpy.mockRestore();
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
      channelID: '886976610018934824',
      contractAddress: ETH_ADDRESS_FIXTURE,
      createdAt: new Date(0),
      guildID: GUILD_ID_FIXTURE,
      id: 1,
      messageID: '123456789',
      name: 'Test Punk #123',
      processed: true,
      tokenID: '123',
      upvoteCount: 2,
      uuid: 'abc123def456',
      voteThreshold: 5,
    };

    const getDaos = await import('../../../../services/dao/getDaos');

    const getDaosSpy = jest
      .spyOn(getDaos, 'getDaos')
      .mockImplementationOnce(async () => FAKE_DAOS_FIXTURE);

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation((m) => m);

    /**
     * Mock db return value
     *
     * @todo fix types
     */
    const dbSpy = (prismaMock.buyNFTPoll as any).findUnique.mockResolvedValue(
      DB_ENTRY
    );

    let e: Error | undefined = undefined;

    try {
      await buyPollReactionHandler({reaction: REACTION, user: USER});
    } catch (error) {
      e = error as Error;
    }

    // Assert no error thrown

    expect(e).toBe(undefined);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    expect(consoleErrorSpy.mock.calls[0][0]).toMatch(
      /There was an error while DM-ing user testuser#1234 about `buy_nft_poll` abc123def456\. Maybe their DMs are turned off\?: Error: Some bad error/i
    );

    expect(dbSpy).toHaveBeenCalledTimes(1);
    expect(dbSpy).toHaveBeenCalledWith({where: {messageID: 'abc123'}});
    expect(getDaosSpy).toHaveBeenCalledTimes(1);
    expect(userReactionRemoveSpy).toHaveBeenCalledTimes(1);
    expect(userReactionRemoveSpy).toHaveBeenCalledWith('123');
    expect(userSendSpy).toHaveBeenCalledTimes(1);

    expect(userSendSpy.mock.calls[0][0]).toMatch(
      /The poll has ended for \*Test Punk #123\*, because the number of required upvotes has been reached\. To purchase, go to <#123123123123123123>\./i
    );

    // Cleanup

    consoleErrorSpy.mockRestore();
    dbSpy.mockRestore();
    getDaosSpy.mockRestore();
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
      channelID: '886976610018934824',
      contractAddress: ETH_ADDRESS_FIXTURE,
      createdAt: new Date(0),
      guildID: GUILD_ID_FIXTURE,
      id: 1,
      messageID: '123456789',
      name: 'Test Punk #123',
      processed: false,
      tokenID: '123',
      upvoteCount: 2,
      uuid: 'abc123def456',
      voteThreshold: 5,
    };

    /**
     * Mock db return value
     *
     * @todo fix types
     */
    const dbSpy = (prismaMock.buyNFTPoll as any).findUnique.mockResolvedValue(
      DB_ENTRY
    );

    await buyPollReactionHandler({reaction: REACTION, user: USER});

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
      channelID: '886976610018934824',
      contractAddress: ETH_ADDRESS_FIXTURE,
      createdAt: new Date(0),
      guildID: GUILD_ID_FIXTURE,
      id: 1,
      messageID: '123456789',
      name: 'Test Punk #123',
      processed: true,
      tokenID: '123',
      upvoteCount: 2,
      uuid: 'abc123def456',
      voteThreshold: 5,
    };

    const getDaos = await import('../../../../services/dao/getDaos');

    const getDaosSpy = jest
      .spyOn(getDaos, 'getDaos')
      .mockImplementationOnce(async () => FAKE_DAOS_FIXTURE);

    /**
     * Mock db return value
     *
     * @todo fix types
     */
    const dbSpy = (prismaMock.buyNFTPoll as any).findUnique.mockResolvedValue(
      DB_ENTRY
    );

    await buyPollReactionHandler({reaction: REACTION, user: USER});

    expect(dbSpy).toHaveBeenCalledTimes(1);
    expect(dbSpy).toHaveBeenCalledWith({where: {messageID: 'abc123'}});
    expect(getDaosSpy).toHaveBeenCalledTimes(1);
    expect(userReactionRemoveSpy).toHaveBeenCalledTimes(1);
    expect(userReactionRemoveSpy).toHaveBeenCalledWith('123');
    expect(userSendSpy).toHaveBeenCalledTimes(1);

    expect(userSendSpy.mock.calls[0][0]).toMatch(
      /The poll has ended for \*Test Punk #123\*, because the number of required upvotes has been reached\. To purchase, go to <#123123123123123123>\./i
    );

    // Cleanup

    dbSpy.mockRestore();
    getDaosSpy.mockRestore();
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
      channelID: '886976610018934824',
      contractAddress: ETH_ADDRESS_FIXTURE,
      createdAt: new Date(0),
      guildID: GUILD_ID_FIXTURE,
      id: 1,
      messageID: '123456789',
      name: 'Test Punk #123',
      processed: false,
      tokenID: '123',
      upvoteCount: 2,
      uuid: 'abc123def456',
      voteThreshold: 5,
    };

    /**
     * Mock db return value
     *
     * @todo fix types
     */
    const dbSpy = (prismaMock.buyNFTPoll as any).findUnique.mockResolvedValue(
      DB_ENTRY
    );

    await buyPollReactionHandler({reaction: REACTION, user: USER});

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
      channelID: '886976610018934824',
      contractAddress: ETH_ADDRESS_FIXTURE,
      createdAt: new Date(0),
      guildID: GUILD_ID_FIXTURE,
      id: 1,
      messageID: '123456789',
      name: 'Test Punk #123',
      processed: false,
      tokenID: '123',
      upvoteCount: 2,
      uuid: 'abc123def456',
      voteThreshold: 5,
    };

    /**
     * Mock db return value
     *
     * @todo fix types
     */
    const dbSpy = (prismaMock.buyNFTPoll as any).findUnique.mockResolvedValue(
      DB_ENTRY
    );

    await buyPollReactionHandler({reaction: REACTION, user: USER});

    expect(reactionFetchSpy).toHaveBeenCalledTimes(1);
    expect(reactionUsersFetchSpy).toHaveBeenCalledTimes(1);

    // Cleanup

    dbSpy.mockRestore();
    reactionFetchSpy.mockRestore();
    reactionUsersFetchSpy.mockRestore();
  });
});
