import {FloorSweeperPoll} from '@prisma/client';
import {CommandInteraction, MessageEmbed} from 'discord.js';

import {
  BYTES32_FIXTURE,
  ETH_ADDRESS_FIXTURE,
  FAKE_DAOS_FIXTURE,
  GUILD_ID_FIXTURE,
} from '../../../../test';
import {confirmCancelPollHandler} from './confirmCancelPollHandler';
import {prismaMock} from '../../../../test/prismaMock';

describe('confirmCancelPollHandler unit tests', () => {
  const DEFAULT_DB_ENTRY: FloorSweeperPoll = {
    actionMessageID: '987654321',
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

  test('should cancel a poll', async () => {
    const interactionUpdateSpy = jest.fn();
    const interactionFollowUpSpy = jest.fn();
    const pollChannelDeleteSpy = jest.fn();

    const pollChannelMessagesFetchSpy = jest
      .fn()
      .mockImplementation(() => ({delete: pollChannelDeleteSpy}));

    const pollChannelFetchSpy = jest.fn().mockImplementationOnce(async () => ({
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
    const dbUpdateMock = (
      prismaMock.floorSweeperPoll as any
    ).update.mockResolvedValue(DEFAULT_DB_ENTRY);

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

    expect(pollChannelFetchSpy).toHaveBeenCalledTimes(1);

    expect(pollChannelFetchSpy).toHaveBeenNthCalledWith(
      1,
      DEFAULT_DB_ENTRY.channelID
    );

    expect(pollChannelMessagesFetchSpy).toHaveBeenCalledTimes(1);

    expect(pollChannelMessagesFetchSpy).toHaveBeenNthCalledWith(
      1,
      DEFAULT_DB_ENTRY.messageID
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

    // Cleanup

    dbUpdateMock.mockRestore();
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
    ).update.mockResolvedValue({...DEFAULT_DB_ENTRY, processed: true});

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
      DEFAULT_DB_ENTRY.channelID
    );

    expect(channelFetchSpy).toHaveBeenNthCalledWith(
      2,
      FAKE_DAOS_FIXTURE.test.applications?.TRIBUTE_TOOLS_BOT?.commands.SWEEP
        .resultChannelID
    );

    expect(pollChannelMessagesFetchSpy).toHaveBeenCalledTimes(1);
    expect(pollChannelMessagesFetchSpy).toHaveBeenNthCalledWith(
      1,
      DEFAULT_DB_ENTRY.messageID
    );

    expect(actionChannelMessagesFetchSpy).toHaveBeenCalledTimes(1);

    expect(actionChannelMessagesFetchSpy).toHaveBeenNthCalledWith(
      1,
      DEFAULT_DB_ENTRY.actionMessageID
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

    expect(actionChannelEditSpy).toHaveBeenCalledTimes(1);

    expect(actionChannelEditSpy).toHaveBeenNthCalledWith(1, {
      components: [],
      embeds: [new MessageEmbed().setDescription('⛔️ Poll cancelled')],
    });

    // Cleanup

    channelFetchSpy.mockRestore();
    dbUpdateMock.mockRestore();
    discordClientSpy.mockRestore();
    getDaosSpy.mockRestore();
  });
});
