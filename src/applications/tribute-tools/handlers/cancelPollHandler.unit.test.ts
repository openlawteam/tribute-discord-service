import {CommandInteraction, MessageActionRow, MessageButton} from 'discord.js';

import {
  BYTES32_FIXTURE,
  ETH_ADDRESS_FIXTURE,
  GUILD_ID_FIXTURE,
} from '../../../../test';
import {CANCEL_POLL_SWEEP_CUSTOM_ID} from '../config';
import {cancelPollHandler} from './cancelPollHandler';
import {FloorSweeperPoll} from '@prisma/client';
import {prismaMock} from '../../../../test/prismaMock';

describe('cancelPollHandler unit tests', () => {
  const DEFAULT_DB_ENTRY: FloorSweeperPoll = {
    actionMessageID: '123456789',
    channelID: '886976610018934824',
    contractAddress: ETH_ADDRESS_FIXTURE,
    createdAt: new Date(0),
    dateEnd: new Date(10),
    guildID: GUILD_ID_FIXTURE,
    id: 1,
    isCancelled: true,
    messageID: '123456789',
    options: {'🇦': 50, '🇧': 100, '🇨': 150, '🚫': 'None'},
    processed: false,
    question: 'How much to sweep larvalads fam?',
    result: 0,
    txHash: BYTES32_FIXTURE,
    txStatus: 'success',
    uuid: 'abc123def456',
  };

  const DEFAULT_CANCEL_BUTTON = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId('confirmCancelPoll-SWEEP-123456789')
      .setLabel('Cancel poll')
      .setStyle('DANGER')
  );

  test('should send user ephemeral message to cancel a poll', async () => {
    const replySpy = jest.fn();

    const FAKE_INTERACTION = {
      customId: CANCEL_POLL_SWEEP_CUSTOM_ID,
      guildId: GUILD_ID_FIXTURE,
      isButton: () => true,
      message: {
        id: '123456789',
      },
      reply: replySpy,
    } as any as CommandInteraction;

    /**
     * Mock db update
     *
     * @todo fix types
     */
    const dbfindMock = (
      prismaMock.floorSweeperPoll as any
    ).findUnique.mockResolvedValue(DEFAULT_DB_ENTRY);

    await cancelPollHandler(FAKE_INTERACTION);

    expect(replySpy).toHaveBeenCalledTimes(1);

    expect(replySpy).toHaveBeenNthCalledWith(1, {
      components: [DEFAULT_CANCEL_BUTTON],
      content: `You're about to cancel and remove the poll, *${DEFAULT_DB_ENTRY.question}*`,
      ephemeral: true,
    });

    expect(dbfindMock).toHaveBeenCalledTimes(1);

    expect(dbfindMock).toHaveBeenNthCalledWith(1, {
      where: {
        messageID: '123456789',
      },
    });

    // Cleanup

    dbfindMock.mockRestore();
  });

  test('should exit if no matching `customId` was found', async () => {
    const replySpy = jest.fn();

    const FAKE_INTERACTION = {
      // Use a bad `customId`
      customId: 'badId',
      guildId: GUILD_ID_FIXTURE,
      isButton: () => true,
      message: {
        id: '123456789',
      },
      reply: replySpy,
    } as any as CommandInteraction;

    /**
     * Mock db update
     *
     * @todo fix types
     */
    const dbfindMock = (
      prismaMock.floorSweeperPoll as any
    ).findUnique.mockResolvedValue(DEFAULT_DB_ENTRY);

    await cancelPollHandler(FAKE_INTERACTION);

    expect(replySpy).toHaveBeenCalledTimes(0);
    expect(dbfindMock).toHaveBeenCalledTimes(0);

    // Cleanup

    dbfindMock.mockRestore();
  });

  test('should exit if `interaction` is not a button', async () => {
    const replySpy = jest.fn();

    const FAKE_INTERACTION = {
      customId: CANCEL_POLL_SWEEP_CUSTOM_ID,
      guildId: GUILD_ID_FIXTURE,
      isButton: () => false,
      message: {
        id: '123456789',
      },
      reply: replySpy,
    } as any as CommandInteraction;

    /**
     * Mock db update
     *
     * @todo fix types
     */
    const dbfindMock = (
      prismaMock.floorSweeperPoll as any
    ).findUnique.mockResolvedValue(DEFAULT_DB_ENTRY);

    await cancelPollHandler(FAKE_INTERACTION);

    expect(replySpy).toHaveBeenCalledTimes(0);
    expect(dbfindMock).toHaveBeenCalledTimes(0);

    // Cleanup

    dbfindMock.mockRestore();
  });

  test('should handle error if `findUnique` throws', async () => {
    const replySpy = jest.fn();

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const FAKE_INTERACTION = {
      customId: CANCEL_POLL_SWEEP_CUSTOM_ID,
      guildId: GUILD_ID_FIXTURE,
      isButton: () => true,
      message: {
        id: '123456789',
      },
      reply: replySpy,
    } as any as CommandInteraction;

    /**
     * Mock db error
     *
     * @todo fix types
     */
    const dbfindMock = (
      prismaMock.floorSweeperPoll as any
    ).findUnique.mockImplementation(() => {
      new Error('Some bad error');
    });

    await cancelPollHandler(FAKE_INTERACTION);

    expect(replySpy).toHaveBeenCalledTimes(1);

    expect(replySpy).toHaveBeenNthCalledWith(1, {
      content: `There was an error while trying to cancel the poll.`,
      ephemeral: true,
    });

    expect(dbfindMock).toHaveBeenCalledTimes(1);

    expect(dbfindMock).toHaveBeenNthCalledWith(1, {
      where: {
        messageID: '123456789',
      },
    });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    expect(consoleErrorSpy.mock.calls[0][0]?.message).toMatch(
      /No poll title was found for message `123456789` in guild `123123123123123123`\./i
    );

    // Cleanup

    dbfindMock.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test('should handle error if `interaction.reply` throws', async () => {
    // Mock only once
    const replySpy = jest.fn().mockImplementationOnce(() => {
      throw Error('Some bad error.');
    });

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const FAKE_INTERACTION = {
      customId: CANCEL_POLL_SWEEP_CUSTOM_ID,
      guildId: GUILD_ID_FIXTURE,
      isButton: () => true,
      message: {
        id: '123456789',
      },
      reply: replySpy,
    } as any as CommandInteraction;

    /**
     * Mock db error
     *
     * @todo fix types
     */
    const dbfindMock = (
      prismaMock.floorSweeperPoll as any
    ).findUnique.mockResolvedValue(DEFAULT_DB_ENTRY);

    await cancelPollHandler(FAKE_INTERACTION);

    expect(replySpy).toHaveBeenCalledTimes(2);

    expect(replySpy).toHaveBeenNthCalledWith(1, {
      components: [DEFAULT_CANCEL_BUTTON],
      content: `You're about to cancel and remove the poll, *${DEFAULT_DB_ENTRY.question}*`,
      ephemeral: true,
    });

    expect(replySpy).toHaveBeenNthCalledWith(2, {
      content: `There was an error while trying to cancel the poll.`,
      ephemeral: true,
    });

    expect(dbfindMock).toHaveBeenCalledTimes(1);

    expect(dbfindMock).toHaveBeenNthCalledWith(1, {
      where: {
        messageID: '123456789',
      },
    });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    expect(consoleErrorSpy.mock.calls[0][0]?.message).toMatch(
      /some bad error\./i
    );

    // Cleanup

    dbfindMock.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test('should handle error if `interaction.reply` in `catch` block throws', async () => {
    const replySpy = jest
      .fn()
      .mockImplementationOnce(() => {
        throw Error('Some bad error.');
      })
      .mockImplementationOnce(() => {
        throw Error('Another bad error.');
      });

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const FAKE_INTERACTION = {
      customId: CANCEL_POLL_SWEEP_CUSTOM_ID,
      guildId: GUILD_ID_FIXTURE,
      isButton: () => true,
      message: {
        id: '123456789',
      },
      reply: replySpy,
    } as any as CommandInteraction;

    /**
     * Mock db error
     *
     * @todo fix types
     */
    const dbfindMock = (
      prismaMock.floorSweeperPoll as any
    ).findUnique.mockResolvedValue(DEFAULT_DB_ENTRY);

    await cancelPollHandler(FAKE_INTERACTION);

    expect(replySpy).toHaveBeenCalledTimes(2);

    expect(replySpy).toHaveBeenNthCalledWith(1, {
      components: [DEFAULT_CANCEL_BUTTON],
      content: `You're about to cancel and remove the poll, *${DEFAULT_DB_ENTRY.question}*`,
      ephemeral: true,
    });

    expect(replySpy).toHaveBeenNthCalledWith(2, {
      content: `There was an error while trying to cancel the poll.`,
      ephemeral: true,
    });

    expect(dbfindMock).toHaveBeenCalledTimes(1);

    expect(dbfindMock).toHaveBeenNthCalledWith(1, {
      where: {
        messageID: '123456789',
      },
    });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);

    expect(consoleErrorSpy.mock.calls[0][0]?.message).toMatch(
      /some bad error\./i
    );

    expect(consoleErrorSpy.mock.calls[1][0]?.message).toMatch(
      /another bad error\./i
    );

    // Cleanup

    dbfindMock.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
