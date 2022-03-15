import {
  BuyNFTPoll,
  FloorSweeperPoll,
  FundAddressPoll,
  Prisma,
} from '@prisma/client';
import {CommandInteraction, MessageActionRow, MessageButton} from 'discord.js';

import {
  CANCEL_POLL_BUY_CUSTOM_ID,
  CANCEL_POLL_FUND_CUSTOM_ID,
  CANCEL_POLL_SWEEP_CUSTOM_ID,
} from '../config';
import {cancelPollHandler} from './cancelPollHandler';
import {ETH_ADDRESS_FIXTURE, GUILD_ID_FIXTURE} from '../../../../test';
import {prismaMock} from '../../../../test/prismaMock';

describe('cancelPollHandler unit tests', () => {
  const DEFAULT_SWEEP_DB_ENTRY: FloorSweeperPoll = {
    actionMessageID: '123456789',
    channelID: '886976610018934824',
    contractAddress: ETH_ADDRESS_FIXTURE,
    createdAt: new Date(0),
    dateEnd: new Date(10),
    guildID: GUILD_ID_FIXTURE,
    id: 1,
    isCancelled: false,
    messageID: '123456789',
    options: {'🇦': 50, '🇧': 100, '🇨': 150, '🚫': 'None'},
    processed: false,
    question: 'How much to sweep larvalads fam?',
    result: 0,
    uuid: 'abc123def456',
  };

  const DEFAULT_BUY_DB_ENTRY: BuyNFTPoll = {
    actionMessageID: '123456789',
    amountWEI: '1000000000000000000' as any as Prisma.Decimal,
    channelID: '886976610018934824',
    contractAddress: ETH_ADDRESS_FIXTURE,
    createdAt: new Date(0),
    guildID: GUILD_ID_FIXTURE,
    id: 1,
    isCancelled: false,
    messageID: '123456789',
    name: 'Conductive the Showy',
    processed: false,
    tokenID: '1234',
    upvoteCount: 0,
    uuid: 'abc123def456',
    voteThreshold: 3,
  };

  const DEFAULT_FUND_DB_ENTRY: FundAddressPoll = {
    actionMessageID: '123456789',
    addressToFund: ETH_ADDRESS_FIXTURE,
    amountUSDC: 50000,
    channelID: '886976610018934824',
    createdAt: new Date(0),
    guildID: GUILD_ID_FIXTURE,
    id: 1,
    isCancelled: false,
    messageID: '123456789',
    processed: false,
    purpose: 'XYZ Seed Round',
    upvoteCount: 0,
    uuid: 'abc123def456',
    voteThreshold: 3,
  };

  const DEFAULT_CANCEL_SWEEP_BUTTON = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId('confirmCancelPoll-SWEEP-123456789')
      .setLabel('Cancel poll')
      .setStyle('DANGER')
  );

  const DEFAULT_CANCEL_BUY_BUTTON = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId('confirmCancelPoll-BUY-123456789')
      .setLabel('Cancel poll')
      .setStyle('DANGER')
  );

  const DEFAULT_CANCEL_FUND_BUTTON = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId('confirmCancelPoll-FUND-123456789')
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

    const dbFindSweepMock = (
      prismaMock.floorSweeperPoll as any
    ).findUnique.mockResolvedValue(DEFAULT_SWEEP_DB_ENTRY);

    const dbFindBuyMock = (
      prismaMock.buyNFTPoll as any
    ).findUnique.mockResolvedValue(DEFAULT_BUY_DB_ENTRY);

    const dbFindFundMock = (
      prismaMock.fundAddressPoll as any
    ).findUnique.mockResolvedValue(DEFAULT_FUND_DB_ENTRY);

    // `/sweep`
    await cancelPollHandler(FAKE_INTERACTION);

    // `/buy`
    await cancelPollHandler({
      ...FAKE_INTERACTION,
      customId: CANCEL_POLL_BUY_CUSTOM_ID,
    } as any as CommandInteraction);

    // `/fund`
    await cancelPollHandler({
      ...FAKE_INTERACTION,
      customId: CANCEL_POLL_FUND_CUSTOM_ID,
    } as any as CommandInteraction);

    expect(replySpy).toHaveBeenCalledTimes(3);

    expect(replySpy).toHaveBeenNthCalledWith(1, {
      components: [DEFAULT_CANCEL_SWEEP_BUTTON],
      content: `You're about to cancel and remove the poll, *${DEFAULT_SWEEP_DB_ENTRY.question}*`,
      ephemeral: true,
    });

    expect(replySpy).toHaveBeenNthCalledWith(2, {
      components: [DEFAULT_CANCEL_BUY_BUTTON],
      content: `You're about to cancel and remove the poll, *${DEFAULT_BUY_DB_ENTRY.name}*`,
      ephemeral: true,
    });

    expect(replySpy).toHaveBeenNthCalledWith(3, {
      components: [DEFAULT_CANCEL_FUND_BUTTON],
      content: `You're about to cancel and remove the poll, *${DEFAULT_FUND_DB_ENTRY.purpose}*`,
      ephemeral: true,
    });

    expect(dbFindSweepMock).toHaveBeenCalledTimes(1);

    expect(dbFindSweepMock).toHaveBeenNthCalledWith(1, {
      where: {
        messageID: '123456789',
      },
    });

    expect(dbFindBuyMock).toHaveBeenCalledTimes(1);

    expect(dbFindBuyMock).toHaveBeenNthCalledWith(1, {
      where: {
        messageID: '123456789',
      },
    });

    expect(dbFindFundMock).toHaveBeenCalledTimes(1);

    expect(dbFindFundMock).toHaveBeenNthCalledWith(1, {
      where: {
        messageID: '123456789',
      },
    });

    // Cleanup

    dbFindBuyMock.mockRestore();
    dbFindFundMock.mockRestore();
    dbFindSweepMock.mockRestore();
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
    const dbFindMock = (
      prismaMock.floorSweeperPoll as any
    ).findUnique.mockResolvedValue(DEFAULT_SWEEP_DB_ENTRY);

    await cancelPollHandler(FAKE_INTERACTION);

    expect(replySpy).toHaveBeenCalledTimes(0);
    expect(dbFindMock).toHaveBeenCalledTimes(0);

    // Cleanup

    dbFindMock.mockRestore();
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
    const dbFindMock = (
      prismaMock.floorSweeperPoll as any
    ).findUnique.mockResolvedValue(DEFAULT_SWEEP_DB_ENTRY);

    await cancelPollHandler(FAKE_INTERACTION);

    expect(replySpy).toHaveBeenCalledTimes(0);
    expect(dbFindMock).toHaveBeenCalledTimes(0);

    // Cleanup

    dbFindMock.mockRestore();
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
    const dbFindMock = (
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

    expect(dbFindMock).toHaveBeenCalledTimes(1);

    expect(dbFindMock).toHaveBeenNthCalledWith(1, {
      where: {
        messageID: '123456789',
      },
    });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    expect(consoleErrorSpy.mock.calls[0][0]?.message).toMatch(
      /No poll title was found for message `123456789` in guild `123123123123123123`\./i
    );

    // Cleanup

    dbFindMock.mockRestore();
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
    const dbFindMock = (
      prismaMock.floorSweeperPoll as any
    ).findUnique.mockResolvedValue(DEFAULT_SWEEP_DB_ENTRY);

    await cancelPollHandler(FAKE_INTERACTION);

    expect(replySpy).toHaveBeenCalledTimes(2);

    expect(replySpy).toHaveBeenNthCalledWith(1, {
      components: [DEFAULT_CANCEL_SWEEP_BUTTON],
      content: `You're about to cancel and remove the poll, *${DEFAULT_SWEEP_DB_ENTRY.question}*`,
      ephemeral: true,
    });

    expect(replySpy).toHaveBeenNthCalledWith(2, {
      content: `There was an error while trying to cancel the poll.`,
      ephemeral: true,
    });

    expect(dbFindMock).toHaveBeenCalledTimes(1);

    expect(dbFindMock).toHaveBeenNthCalledWith(1, {
      where: {
        messageID: '123456789',
      },
    });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    expect(consoleErrorSpy.mock.calls[0][0]?.message).toMatch(
      /some bad error\./i
    );

    // Cleanup

    dbFindMock.mockRestore();
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
    const dbFindMock = (
      prismaMock.floorSweeperPoll as any
    ).findUnique.mockResolvedValue(DEFAULT_SWEEP_DB_ENTRY);

    await cancelPollHandler(FAKE_INTERACTION);

    expect(replySpy).toHaveBeenCalledTimes(2);

    expect(replySpy).toHaveBeenNthCalledWith(1, {
      components: [DEFAULT_CANCEL_SWEEP_BUTTON],
      content: `You're about to cancel and remove the poll, *${DEFAULT_SWEEP_DB_ENTRY.question}*`,
      ephemeral: true,
    });

    expect(replySpy).toHaveBeenNthCalledWith(2, {
      content: `There was an error while trying to cancel the poll.`,
      ephemeral: true,
    });

    expect(dbFindMock).toHaveBeenCalledTimes(1);

    expect(dbFindMock).toHaveBeenNthCalledWith(1, {
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

    dbFindMock.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
