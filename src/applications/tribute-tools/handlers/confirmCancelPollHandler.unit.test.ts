import {CommandInteraction, MessageEmbed} from 'discord.js';
import {
  BuyNFTPoll,
  FloorSweeperPoll,
  FundAddressPoll,
  Prisma,
} from '@prisma/client';

import {
  BYTES32_FIXTURE,
  ETH_ADDRESS_FIXTURE,
  FAKE_DAOS_FIXTURE,
  GUILD_ID_FIXTURE,
} from '../../../../test';
import {confirmCancelPollHandler} from './confirmCancelPollHandler';
import {prismaMock} from '../../../../test/prismaMock';

describe('confirmCancelPollHandler unit tests', () => {
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
    txHash: BYTES32_FIXTURE,
    txStatus: 'success',
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
    txHash: BYTES32_FIXTURE,
    txStatus: 'success',
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
    txHash: BYTES32_FIXTURE,
    txStatus: 'success',
    upvoteCount: 0,
    uuid: 'abc123def456',
    voteThreshold: 3,
  };

  test('should cancel a poll', async () => {
    const interactionUpdateSpy = jest.fn();
    const interactionFollowUpSpy = jest.fn();
    const pollChannelDeleteSpy = jest.fn();

    const pollChannelMessagesFetchSpy = jest
      .fn()
      .mockImplementation(() => ({delete: pollChannelDeleteSpy}));

    const pollChannelFetchSpy = jest.fn().mockImplementation(async () => ({
      messages: {fetch: pollChannelMessagesFetchSpy},
    }));

    const FAKE_INTERACTION = {
      customId: 'confirmCancelPoll-SWEEP-123456789',
      followUp: interactionFollowUpSpy,
      guildId: GUILD_ID_FIXTURE,
      isButton: () => true,
      message: {
        id: '123456789',
      },
      update: interactionUpdateSpy,
    } as any as CommandInteraction;

    const discordClientSpy = jest
      .spyOn(await import('../getTributeToolsClient'), 'getTributeToolsClient')
      .mockImplementation(async () => ({
        client: {
          channels: {
            fetch: pollChannelFetchSpy,
          },
        } as any,
        stop: async () => undefined,
      }));

    /**
     * Mock db update
     *
     * @todo fix types
     */

    const dbUpdateSweepMock = (
      prismaMock.floorSweeperPoll as any
    ).update.mockResolvedValue(DEFAULT_SWEEP_DB_ENTRY);

    const dbUpdateBuyMock = (
      prismaMock.buyNFTPoll as any
    ).update.mockResolvedValue(DEFAULT_BUY_DB_ENTRY);

    const dbUpdateFundMock = (
      prismaMock.fundAddressPoll as any
    ).update.mockResolvedValue(DEFAULT_FUND_DB_ENTRY);

    await confirmCancelPollHandler(FAKE_INTERACTION);

    await confirmCancelPollHandler({
      ...FAKE_INTERACTION,
      customId: 'confirmCancelPoll-BUY-123456789',
    } as any as CommandInteraction);

    await confirmCancelPollHandler({
      ...FAKE_INTERACTION,
      customId: 'confirmCancelPoll-FUND-123456789',
    } as any as CommandInteraction);

    expect(dbUpdateSweepMock).toHaveBeenCalledTimes(1);

    expect(dbUpdateSweepMock).toHaveBeenNthCalledWith(1, {
      data: {
        isCancelled: true,
      },
      where: {
        messageID: '123456789',
      },
    });

    expect(dbUpdateBuyMock).toHaveBeenCalledTimes(1);

    expect(dbUpdateBuyMock).toHaveBeenNthCalledWith(1, {
      data: {
        isCancelled: true,
      },
      where: {
        messageID: '123456789',
      },
    });

    expect(dbUpdateFundMock).toHaveBeenCalledTimes(1);

    expect(dbUpdateFundMock).toHaveBeenNthCalledWith(1, {
      data: {
        isCancelled: true,
      },
      where: {
        messageID: '123456789',
      },
    });

    expect(pollChannelFetchSpy).toHaveBeenCalledTimes(3);

    expect(pollChannelFetchSpy).toHaveBeenNthCalledWith(
      1,
      DEFAULT_SWEEP_DB_ENTRY.channelID
    );

    expect(pollChannelFetchSpy).toHaveBeenNthCalledWith(
      2,
      DEFAULT_BUY_DB_ENTRY.channelID
    );

    expect(pollChannelFetchSpy).toHaveBeenNthCalledWith(
      3,
      DEFAULT_FUND_DB_ENTRY.channelID
    );

    expect(pollChannelMessagesFetchSpy).toHaveBeenCalledTimes(3);

    expect(pollChannelMessagesFetchSpy).toHaveBeenNthCalledWith(
      1,
      DEFAULT_SWEEP_DB_ENTRY.messageID
    );

    expect(pollChannelMessagesFetchSpy).toHaveBeenNthCalledWith(
      2,
      DEFAULT_BUY_DB_ENTRY.messageID
    );

    expect(pollChannelMessagesFetchSpy).toHaveBeenNthCalledWith(
      3,
      DEFAULT_FUND_DB_ENTRY.messageID
    );

    expect(pollChannelDeleteSpy).toHaveBeenCalledTimes(3);
    expect(pollChannelDeleteSpy).toHaveBeenNthCalledWith(1);
    expect(pollChannelDeleteSpy).toHaveBeenNthCalledWith(2);
    expect(pollChannelDeleteSpy).toHaveBeenNthCalledWith(3);

    expect(interactionUpdateSpy).toHaveBeenCalledTimes(3);

    expect(interactionUpdateSpy).toHaveBeenNthCalledWith(1, {
      components: [],
      content: `You've removed the poll, *How much to sweep larvalads fam?*.`,
    });

    expect(interactionUpdateSpy).toHaveBeenNthCalledWith(2, {
      components: [],
      content: `You've removed the poll, *Conductive the Showy*.`,
    });

    expect(interactionUpdateSpy).toHaveBeenNthCalledWith(3, {
      components: [],
      content: `You've removed the poll, *XYZ Seed Round*.`,
    });

    expect(interactionFollowUpSpy).toHaveBeenCalledTimes(3);

    expect(interactionFollowUpSpy).toHaveBeenNthCalledWith(1, {
      content:
        'The following poll has been cancelled and removed: *How much to sweep larvalads fam?*.',
    });

    expect(interactionFollowUpSpy).toHaveBeenNthCalledWith(2, {
      content:
        'The following poll has been cancelled and removed: *Conductive the Showy*.',
    });

    expect(interactionFollowUpSpy).toHaveBeenNthCalledWith(3, {
      content:
        'The following poll has been cancelled and removed: *XYZ Seed Round*.',
    });

    // Cleanup

    dbUpdateBuyMock.mockRestore();
    dbUpdateFundMock.mockRestore();
    dbUpdateSweepMock.mockRestore();
    discordClientSpy.mockRestore();
  });

  test('should cancel an already processed poll', async () => {
    const interactionUpdateSpy = jest.fn();
    const interactionFollowUpSpy = jest.fn();
    const pollChannelDeleteSpy = jest.fn();
    const actionChannelEditSpy = jest.fn();

    const pollChannelMessagesFetchSpy = jest.fn().mockImplementation(() => ({
      delete: pollChannelDeleteSpy,
    }));

    const actionChannelMessagesFetchSpy = jest.fn().mockImplementation(() => ({
      edit: actionChannelEditSpy,
    }));

    const channelFetchSpy = jest
      .fn()
      .mockImplementationOnce(async () => ({
        messages: {fetch: pollChannelMessagesFetchSpy},
      }))
      .mockImplementationOnce(async () => ({
        messages: {fetch: actionChannelMessagesFetchSpy},
      }));

    const FAKE_INTERACTION = {
      customId: 'confirmCancelPoll-SWEEP-123456789',
      followUp: interactionFollowUpSpy,
      guildId: GUILD_ID_FIXTURE,
      isButton: () => true,
      message: {
        id: '123456789',
      },
      update: interactionUpdateSpy,
    } as any as CommandInteraction;

    const discordClientSpy = jest
      .spyOn(await import('../getTributeToolsClient'), 'getTributeToolsClient')
      .mockImplementation(async () => ({
        client: {
          channels: {
            fetch: channelFetchSpy,
          },
        } as any,
        stop: async () => undefined,
      }));

    /**
     * Mock db update
     *
     * @todo fix types
     */
    const dbUpdateMock = (
      prismaMock.floorSweeperPoll as any
    ).update.mockResolvedValue({...DEFAULT_SWEEP_DB_ENTRY, processed: true});

    const getDaosSpy = jest
      .spyOn(await import('../../../services/dao/getDaos'), 'getDaos')
      .mockImplementation(async () => FAKE_DAOS_FIXTURE);

    await confirmCancelPollHandler(FAKE_INTERACTION);

    expect(dbUpdateMock).toHaveBeenCalledTimes(1);

    expect(dbUpdateMock).toHaveBeenNthCalledWith(1, {
      data: {
        isCancelled: true,
      },
      where: {
        messageID: '123456789',
      },
    });

    expect(channelFetchSpy).toHaveBeenCalledTimes(2);

    expect(channelFetchSpy).toHaveBeenNthCalledWith(
      1,
      DEFAULT_SWEEP_DB_ENTRY.channelID
    );

    expect(channelFetchSpy).toHaveBeenNthCalledWith(
      2,
      FAKE_DAOS_FIXTURE.test.applications?.TRIBUTE_TOOLS_BOT?.commands.SWEEP
        .resultChannelID
    );

    expect(pollChannelMessagesFetchSpy).toHaveBeenCalledTimes(1);
    expect(pollChannelMessagesFetchSpy).toHaveBeenNthCalledWith(
      1,
      DEFAULT_SWEEP_DB_ENTRY.messageID
    );

    expect(actionChannelMessagesFetchSpy).toHaveBeenCalledTimes(1);

    expect(actionChannelMessagesFetchSpy).toHaveBeenNthCalledWith(
      1,
      DEFAULT_SWEEP_DB_ENTRY.actionMessageID
    );

    expect(pollChannelDeleteSpy).toHaveBeenCalledTimes(1);
    expect(pollChannelDeleteSpy).toHaveBeenNthCalledWith(1);

    expect(interactionUpdateSpy).toHaveBeenCalledTimes(1);

    expect(interactionUpdateSpy).toHaveBeenNthCalledWith(1, {
      components: [],
      content: `You've removed the poll, *How much to sweep larvalads fam?*.`,
    });

    expect(interactionFollowUpSpy).toHaveBeenCalledTimes(1);

    expect(interactionFollowUpSpy).toHaveBeenNthCalledWith(1, {
      content:
        'The following poll has been cancelled and removed: *How much to sweep larvalads fam?*.',
    });

    expect(getDaosSpy).toHaveBeenCalledTimes(1);
    expect(actionChannelEditSpy).toHaveBeenCalledTimes(1);

    expect(actionChannelEditSpy).toHaveBeenNthCalledWith(1, {
      components: [],
      embeds: [new MessageEmbed().setDescription('⛔️ Poll cancelled')],
    });

    // Cleanup

    dbUpdateMock.mockRestore();
    discordClientSpy.mockRestore();
    getDaosSpy.mockRestore();
  });

  test('should exit if `interaction` is not a button', async () => {
    const FAKE_INTERACTION = {
      customId: 'confirmCancelPoll-SWEEP-123456789',
      guildId: GUILD_ID_FIXTURE,
      // Not a button
      isButton: () => false,
      message: {
        id: '123456789',
      },
    } as any as CommandInteraction;

    /**
     * Mock db update
     *
     * @todo fix types
     */
    const dbUpdateMock = (
      prismaMock.floorSweeperPoll as any
    ).update.mockResolvedValue(DEFAULT_SWEEP_DB_ENTRY);

    await confirmCancelPollHandler(FAKE_INTERACTION);

    expect(dbUpdateMock).toHaveBeenCalledTimes(0);

    // Cleanup

    dbUpdateMock.mockRestore();
  });

  test('should exit if `customId` does not match `RegExp`', async () => {
    const FAKE_INTERACTION = {
      // Does not match
      customId: 'confirmCancelPoll-BAD-123456789',
      guildId: GUILD_ID_FIXTURE,
      isButton: () => true,
      message: {
        id: '123456789',
      },
    } as any as CommandInteraction;

    /**
     * Mock db update
     *
     * @todo fix types
     */
    const dbUpdateMock = (
      prismaMock.floorSweeperPoll as any
    ).update.mockResolvedValue(DEFAULT_SWEEP_DB_ENTRY);

    await confirmCancelPollHandler(FAKE_INTERACTION);

    expect(dbUpdateMock).toHaveBeenCalledTimes(0);

    // Cleanup

    dbUpdateMock.mockRestore();
  });

  test('should exit if `actionMessageID` is not found on DB entry', async () => {
    const interactionUpdateSpy = jest.fn();
    const interactionFollowUpSpy = jest.fn();
    const pollChannelDeleteSpy = jest.fn();
    const actionChannelEditSpy = jest.fn();

    const pollChannelMessagesFetchSpy = jest.fn().mockImplementation(() => ({
      delete: pollChannelDeleteSpy,
    }));

    const actionChannelMessagesFetchSpy = jest.fn().mockImplementation(() => ({
      edit: actionChannelEditSpy,
    }));

    const channelFetchSpy = jest
      .fn()
      .mockImplementationOnce(async () => ({
        messages: {fetch: pollChannelMessagesFetchSpy},
      }))
      .mockImplementationOnce(async () => ({
        messages: {fetch: actionChannelMessagesFetchSpy},
      }));

    const FAKE_INTERACTION = {
      customId: 'confirmCancelPoll-SWEEP-123456789',
      followUp: interactionFollowUpSpy,
      guildId: GUILD_ID_FIXTURE,
      isButton: () => true,
      message: {
        id: '123456789',
      },
      update: interactionUpdateSpy,
    } as any as CommandInteraction;

    const discordClientSpy = jest
      .spyOn(await import('../getTributeToolsClient'), 'getTributeToolsClient')
      .mockImplementation(async () => ({
        client: {
          channels: {
            fetch: channelFetchSpy,
          },
        } as any,
        stop: async () => undefined,
      }));

    /**
     * Mock db update
     *
     * @todo fix types
     */
    const dbUpdateMock = (
      prismaMock.floorSweeperPoll as any
    ).update.mockResolvedValue({
      ...DEFAULT_SWEEP_DB_ENTRY,
      actionMessageID: null,
      processed: true,
    });

    await confirmCancelPollHandler(FAKE_INTERACTION);

    expect(dbUpdateMock).toHaveBeenCalledTimes(1);

    expect(dbUpdateMock).toHaveBeenNthCalledWith(1, {
      data: {
        isCancelled: true,
      },
      where: {
        messageID: '123456789',
      },
    });

    expect(channelFetchSpy).toHaveBeenCalledTimes(1);

    expect(channelFetchSpy).toHaveBeenNthCalledWith(
      1,
      DEFAULT_SWEEP_DB_ENTRY.channelID
    );

    expect(pollChannelMessagesFetchSpy).toHaveBeenCalledTimes(1);
    expect(pollChannelMessagesFetchSpy).toHaveBeenNthCalledWith(
      1,
      DEFAULT_SWEEP_DB_ENTRY.messageID
    );

    expect(actionChannelMessagesFetchSpy).toHaveBeenCalledTimes(0);

    expect(pollChannelDeleteSpy).toHaveBeenCalledTimes(1);
    expect(pollChannelDeleteSpy).toHaveBeenNthCalledWith(1);

    expect(interactionUpdateSpy).toHaveBeenCalledTimes(1);

    expect(interactionUpdateSpy).toHaveBeenNthCalledWith(1, {
      components: [],
      content: `You've removed the poll, *How much to sweep larvalads fam?*.`,
    });

    expect(interactionFollowUpSpy).toHaveBeenCalledTimes(1);

    expect(interactionFollowUpSpy).toHaveBeenNthCalledWith(1, {
      content:
        'The following poll has been cancelled and removed: *How much to sweep larvalads fam?*.',
    });

    // Assert "edit" code block exited early
    expect(actionChannelEditSpy).toHaveBeenCalledTimes(0);

    // Cleanup

    dbUpdateMock.mockRestore();
    discordClientSpy.mockRestore();
  });

  test('should exit if DAO is not found', async () => {
    const interactionUpdateSpy = jest.fn();
    const interactionFollowUpSpy = jest.fn();
    const pollChannelDeleteSpy = jest.fn();
    const actionChannelEditSpy = jest.fn();

    const pollChannelMessagesFetchSpy = jest.fn().mockImplementation(() => ({
      delete: pollChannelDeleteSpy,
    }));

    const actionChannelMessagesFetchSpy = jest.fn().mockImplementation(() => ({
      edit: actionChannelEditSpy,
    }));

    const channelFetchSpy = jest
      .fn()
      .mockImplementationOnce(async () => ({
        messages: {fetch: pollChannelMessagesFetchSpy},
      }))
      .mockImplementationOnce(async () => ({
        messages: {fetch: actionChannelMessagesFetchSpy},
      }));

    const FAKE_INTERACTION = {
      customId: 'confirmCancelPoll-SWEEP-123456789',
      followUp: interactionFollowUpSpy,
      guildId: GUILD_ID_FIXTURE,
      isButton: () => true,
      message: {
        id: '123456789',
      },
      update: interactionUpdateSpy,
    } as any as CommandInteraction;

    const discordClientSpy = jest
      .spyOn(await import('../getTributeToolsClient'), 'getTributeToolsClient')
      .mockImplementation(async () => ({
        client: {
          channels: {
            fetch: channelFetchSpy,
          },
        } as any,
        stop: async () => undefined,
      }));

    const getDaosSpy = jest
      .spyOn(await import('../../../services/dao/getDaos'), 'getDaos')
      .mockImplementation(async () => undefined);

    /**
     * Mock db update
     *
     * @todo fix types
     */
    const dbUpdateMock = (
      prismaMock.floorSweeperPoll as any
    ).update.mockResolvedValue({...DEFAULT_SWEEP_DB_ENTRY, processed: true});

    await confirmCancelPollHandler(FAKE_INTERACTION);

    expect(dbUpdateMock).toHaveBeenCalledTimes(1);

    expect(dbUpdateMock).toHaveBeenNthCalledWith(1, {
      data: {
        isCancelled: true,
      },
      where: {
        messageID: '123456789',
      },
    });

    expect(channelFetchSpy).toHaveBeenCalledTimes(1);

    expect(channelFetchSpy).toHaveBeenNthCalledWith(
      1,
      DEFAULT_SWEEP_DB_ENTRY.channelID
    );

    expect(pollChannelMessagesFetchSpy).toHaveBeenCalledTimes(1);
    expect(pollChannelMessagesFetchSpy).toHaveBeenNthCalledWith(
      1,
      DEFAULT_SWEEP_DB_ENTRY.messageID
    );

    expect(actionChannelMessagesFetchSpy).toHaveBeenCalledTimes(0);

    expect(pollChannelDeleteSpy).toHaveBeenCalledTimes(1);
    expect(pollChannelDeleteSpy).toHaveBeenNthCalledWith(1);

    expect(interactionUpdateSpy).toHaveBeenCalledTimes(1);

    expect(interactionUpdateSpy).toHaveBeenNthCalledWith(1, {
      components: [],
      content: `You've removed the poll, *How much to sweep larvalads fam?*.`,
    });

    expect(interactionFollowUpSpy).toHaveBeenCalledTimes(1);

    expect(interactionFollowUpSpy).toHaveBeenNthCalledWith(1, {
      content:
        'The following poll has been cancelled and removed: *How much to sweep larvalads fam?*.',
    });

    // Assert "edit" code block exited early
    expect(getDaosSpy).toHaveBeenCalledTimes(1);
    expect(actionChannelEditSpy).toHaveBeenCalledTimes(0);

    // Cleanup

    dbUpdateMock.mockRestore();
    discordClientSpy.mockRestore();
    getDaosSpy.mockRestore();
  });

  test('should handle error if DB return data is `undefined`', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation((e) => e);

    const interactionReplySpy = jest.fn();

    const FAKE_INTERACTION = {
      customId: 'confirmCancelPoll-SWEEP-123456789',
      guildId: GUILD_ID_FIXTURE,
      isButton: () => true,
      message: {
        id: '123456789',
      },
      reply: interactionReplySpy,
    } as any as CommandInteraction;

    /**
     * Mock db update
     *
     * @todo fix types
     */
    const dbUpdateMock = (
      prismaMock.floorSweeperPoll as any
    ).update.mockResolvedValue(undefined);

    await confirmCancelPollHandler(FAKE_INTERACTION);

    expect(dbUpdateMock).toHaveBeenCalledTimes(1);

    expect(dbUpdateMock).toHaveBeenNthCalledWith(1, {
      data: {
        isCancelled: true,
      },
      where: {
        messageID: '123456789',
      },
    });

    expect(interactionReplySpy).toHaveBeenCalledTimes(1);

    expect(interactionReplySpy).toHaveBeenNthCalledWith(1, {
      content: 'There was an error while trying to cancel the poll.',
      ephemeral: true,
    });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    expect(consoleErrorSpy.mock.calls[0][0]?.message).toMatch(
      /No poll entry was found for command type `SWEEP`, `messageID` `123456789`/i
    );

    // Cleanup

    consoleErrorSpy.mockRestore();
    dbUpdateMock.mockRestore();
  });

  test('should handle Prisma error code `P2025` if DB entry is not found', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation((e) => e);

    const interactionReplySpy = jest.fn();

    const FAKE_INTERACTION = {
      customId: 'confirmCancelPoll-SWEEP-123456789',
      guildId: GUILD_ID_FIXTURE,
      isButton: () => true,
      message: {
        id: '123456789',
      },
      reply: interactionReplySpy,
    } as any as CommandInteraction;

    /**
     * Mock db update
     *
     * @todo fix types
     */
    const dbUpdateMock = (
      prismaMock.floorSweeperPoll as any
    ).update.mockImplementation(async () => {
      throw new Prisma.PrismaClientKnownRequestError(
        'Prisma error',
        'P2025',
        '1.0'
      );
    });

    await confirmCancelPollHandler(FAKE_INTERACTION);

    expect(dbUpdateMock).toHaveBeenCalledTimes(1);

    expect(dbUpdateMock).toHaveBeenNthCalledWith(1, {
      data: {
        isCancelled: true,
      },
      where: {
        messageID: '123456789',
      },
    });

    expect(interactionReplySpy).toHaveBeenCalledTimes(1);

    expect(interactionReplySpy).toHaveBeenNthCalledWith(1, {
      content: 'There was an error while trying to cancel the poll.',
      ephemeral: true,
    });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    expect(consoleErrorSpy.mock.calls[0][0]?.message).toMatch(
      /No poll entry was found for command type `SWEEP`, `messageID` `123456789`/i
    );

    // Cleanup

    consoleErrorSpy.mockRestore();
    dbUpdateMock.mockRestore();
  });

  test('should handle error if something goes wrong while updating the DB data', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation((e) => e);

    const interactionReplySpy = jest.fn();

    const FAKE_INTERACTION = {
      customId: 'confirmCancelPoll-SWEEP-123456789',
      guildId: GUILD_ID_FIXTURE,
      isButton: () => true,
      message: {
        id: '123456789',
      },
      reply: interactionReplySpy,
    } as any as CommandInteraction;

    /**
     * Mock db update
     *
     * @todo fix types
     */
    const dbUpdateMock = (
      prismaMock.floorSweeperPoll as any
    ).update.mockImplementation(async () => {
      throw new Error('Some bad DB error.');
    });

    await confirmCancelPollHandler(FAKE_INTERACTION);

    expect(dbUpdateMock).toHaveBeenCalledTimes(1);

    expect(dbUpdateMock).toHaveBeenNthCalledWith(1, {
      data: {
        isCancelled: true,
      },
      where: {
        messageID: '123456789',
      },
    });

    expect(interactionReplySpy).toHaveBeenCalledTimes(1);

    expect(interactionReplySpy).toHaveBeenNthCalledWith(1, {
      content: 'There was an error while trying to cancel the poll.',
      ephemeral: true,
    });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    expect(consoleErrorSpy.mock.calls[0][0]?.message).toMatch(
      /Something went wrong while saving the transaction data for command type `SWEEP`, `messageID` `123456789`: Error: Some bad DB error/i
    );

    // Cleanup

    consoleErrorSpy.mockRestore();
    dbUpdateMock.mockRestore();
  });

  test('should handle error if `interaction.reply` in `catch` block throws', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation((e) => e);

    const interactionReplySpy = jest.fn().mockImplementation(async () => {
      throw new Error('Reply error');
    });

    const FAKE_INTERACTION = {
      customId: 'confirmCancelPoll-SWEEP-123456789',
      guildId: GUILD_ID_FIXTURE,
      isButton: () => true,
      message: {
        id: '123456789',
      },
      reply: interactionReplySpy,
    } as any as CommandInteraction;

    /**
     * Mock db update
     *
     * @todo fix types
     */
    const dbUpdateMock = (
      prismaMock.floorSweeperPoll as any
    ).update.mockImplementation(async () => {
      throw new Error('Some bad DB error');
    });

    await confirmCancelPollHandler(FAKE_INTERACTION);

    expect(dbUpdateMock).toHaveBeenCalledTimes(1);

    expect(dbUpdateMock).toHaveBeenNthCalledWith(1, {
      data: {
        isCancelled: true,
      },
      where: {
        messageID: '123456789',
      },
    });

    expect(interactionReplySpy).toHaveBeenCalledTimes(1);

    expect(interactionReplySpy).toHaveBeenNthCalledWith(1, {
      content: 'There was an error while trying to cancel the poll.',
      ephemeral: true,
    });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);

    expect(consoleErrorSpy.mock.calls[0][0]?.message).toMatch(
      /Something went wrong while saving the transaction data for command type `SWEEP`, `messageID` `123456789`: Error: Some bad DB error/i
    );

    expect(consoleErrorSpy.mock.calls[1][0]?.message).toMatch(/Reply error/i);

    // Cleanup

    consoleErrorSpy.mockRestore();
    dbUpdateMock.mockRestore();
  });
});
