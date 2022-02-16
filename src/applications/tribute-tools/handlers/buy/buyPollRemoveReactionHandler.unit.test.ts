import {
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from 'discord.js';

import {buyPollRemoveReactionHandler} from './buyPollRemoveReactionHandler';
import {ETH_ADDRESS_FIXTURE, GUILD_ID_FIXTURE} from '../../../../../test';
import {prismaMock} from '../../../../../test/prismaMock';

describe('buyPollRemoveReactionHandler unit tests', () => {
  const ERROR_REGEXP =
    /Something went wrong while handling a removed Discord reaction: Error: Some bad error/i;

  test('should subtract from upvote count in db', async () => {
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
      channelID: '886976610018934824',
      contractAddress: ETH_ADDRESS_FIXTURE,
      createdAt: new Date(0),
      guildID: GUILD_ID_FIXTURE,
      id: 1,
      messageID: 'abc123',
      name: 'Test Punk #123',
      processed: false,
      tokenID: '123',
      upvoteCount: 2,
      uuid: 'abc123def456',
      voteThreshold: 5,
    };

    /**
     * Mock db find
     *
     * @todo fix types
     */
    const dbFindSpy = (
      prismaMock.buyNFTPoll as any
    ).findUnique.mockResolvedValue(DB_ENTRY);

    /**
     * Mock db update
     *
     * @todo fix types
     */
    const dbUpdateSpy = (
      prismaMock.buyNFTPoll as any
    ).update.mockImplementation(async () => {});

    await buyPollRemoveReactionHandler({reaction: REACTION, user: USER});

    expect(dbUpdateSpy).toBeCalledTimes(1);

    expect(dbUpdateSpy.mock.calls[0][0]).toEqual({
      data: {upvoteCount: 1},
      where: {messageID: DB_ENTRY.messageID},
    });

    // Cleanup

    dbFindSpy.mockRestore();
    dbUpdateSpy.mockRestore();
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

    buyPollRemoveReactionHandler({
      reaction: REACTION,
      user: USER,
    });
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
          cache: [],
        },
      },
    } as any;

    const USER: User | PartialUser = {bot: false, id: '123'} as any;

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

    await buyPollRemoveReactionHandler({reaction: REACTION, user: USER});

    expect(dbSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy.mock.calls[0][0]).toMatch(ERROR_REGEXP);

    // Cleanup

    consoleErrorSpy.mockRestore();
    dbSpy.mockRestore();
  });

  test('should exit with no error if error updating db entry', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation((m) => m);

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
     * Mock db find
     *
     * @todo fix types
     */
    const dbFindSpy = (
      prismaMock.buyNFTPoll as any
    ).findUnique.mockResolvedValue(DB_ENTRY);

    /**
     * Mock db update
     *
     * @todo fix types
     */
    const dbUpdateSpy = (
      prismaMock.buyNFTPoll as any
    ).update.mockImplementation(() => {
      throw new Error('Some bad error');
    });

    await buyPollRemoveReactionHandler({reaction: REACTION, user: USER});

    expect(dbFindSpy).toBeCalledTimes(1);
    expect(dbUpdateSpy).toBeCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy.mock.calls[0][0]).toMatch(ERROR_REGEXP);

    // Cleanup

    consoleErrorSpy.mockRestore();
    dbFindSpy.mockRestore();
    dbUpdateSpy.mockRestore();
  });

  test('should fetch data if reaction is `partial: true`', async () => {
    const reactionFetchSpy = jest.fn();

    const REACTION: MessageReaction | PartialMessageReaction = {
      emoji: {name: '👍'},
      fetch: reactionFetchSpy,
      message: {
        id: 'abc123',
        reactions: {
          cache: [],
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

    await buyPollRemoveReactionHandler({reaction: REACTION, user: USER});

    expect(reactionFetchSpy).toHaveBeenCalledTimes(1);

    // Cleanup

    dbSpy.mockRestore();
    reactionFetchSpy.mockRestore();
  });
});
