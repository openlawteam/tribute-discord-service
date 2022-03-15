import {
  BuyNFTPoll,
  FloorSweeperPoll,
  FundAddressPoll,
  Prisma,
} from '@prisma/client';
import {MessageEmbed} from 'discord.js';

import {
  TributeToolsWebhookTxStatus,
  TributeToolsWebhookTxType,
} from '../../../http-api/types';
import {
  BYTES32_FIXTURE,
  ETH_ADDRESS_FIXTURE,
  FAKE_DAOS_FIXTURE,
  GUILD_ID_FIXTURE,
  UUID_FIXTURE,
} from '../../../../test/fixtures';
import {notifyPollTxStatus} from './notifyPollTxStatus';
import {prismaMock} from '../../../../test/prismaMock';

describe('notifyPollTxStatus unit tests', () => {
  const SWEEP_DB_ENTRY: FloorSweeperPoll = {
    actionMessageID: '987654321',
    channelID: '123456789',
    contractAddress: ETH_ADDRESS_FIXTURE,
    createdAt: new Date(0),
    dateEnd: new Date(10000),
    guildID: GUILD_ID_FIXTURE,
    id: 1,
    isCancelled: false,
    messageID: '567890123',
    options: {'🇦': 50, '🇧': 100, '🇨': 150, '🚫': 'None'},
    processed: true,
    question: 'How much in punks should we sweep?',
    result: 100,
    uuid: UUID_FIXTURE,
  };

  const BUY_DB_ENTRY: BuyNFTPoll = {
    actionMessageID: '987654321',
    amountWEI: new Prisma.Decimal('2200000000000000000'),
    channelID: '123456789',
    contractAddress: ETH_ADDRESS_FIXTURE,
    createdAt: new Date(0),
    guildID: GUILD_ID_FIXTURE,
    id: 1,
    isCancelled: false,
    messageID: '567890123',
    name: 'Should we buy Dexter Funky Xavier?',
    processed: true,
    tokenID: '123',
    upvoteCount: 5,
    uuid: UUID_FIXTURE,
    voteThreshold: 5,
  };

  const FUND_DB_ENTRY: FundAddressPoll = {
    actionMessageID: '987654321',
    addressToFund: ETH_ADDRESS_FIXTURE,
    amountUSDC: 123,
    channelID: '123456789',
    createdAt: new Date(0),
    guildID: GUILD_ID_FIXTURE,
    id: 1,
    isCancelled: false,
    messageID: '567890123',
    processed: true,
    purpose: 'Seed round for Tribute Labs',
    upvoteCount: 5,
    uuid: UUID_FIXTURE,
    voteThreshold: 5,
  };

  async function mockDaosHelper() {
    const getDaos = await import('../../../services/dao/getDaos');

    return jest
      .spyOn(getDaos, 'getDaos')
      .mockImplementationOnce(async () => FAKE_DAOS_FIXTURE);
  }

  test('should notify Discord when a successful transaction is sent for `/sweep`', async () => {
    const messagesFetchSpy = jest.fn().mockImplementation(async () => ({
      edit: messageEditSpy,
      reply: messageReplySpy,
    }));

    const channelsFetchSpy = jest.fn().mockImplementation(async () => ({
      messages: {
        fetch: messagesFetchSpy,
      },
    }));

    const discordClientSpy = jest
      .spyOn(await import('../getTributeToolsClient'), 'getTributeToolsClient')
      .mockImplementation(async () => ({
        client: {
          channels: {
            fetch: channelsFetchSpy,
          },
        } as any,
        stop: async () => undefined,
      }));

    const floorSweeperPollSpy = (
      prismaMock.floorSweeperPoll as any
    ).findUnique.mockResolvedValue(SWEEP_DB_ENTRY);

    const daosSpy = await mockDaosHelper();
    const messageEditSpy = jest.fn();
    const messageReplySpy = jest.fn();

    const result = await notifyPollTxStatus({
      data: {
        id: UUID_FIXTURE,
        type: TributeToolsWebhookTxType.SWEEP,
        tx: {
          hash: BYTES32_FIXTURE,
          status: TributeToolsWebhookTxStatus.SUCCESS,
        },
      },
    });

    expect(floorSweeperPollSpy).toHaveBeenCalledTimes(1);

    expect(floorSweeperPollSpy).toHaveBeenNthCalledWith(1, {
      where: {
        uuid: UUID_FIXTURE,
      },
    });

    expect(result).toBe(undefined);
    expect(channelsFetchSpy).toHaveBeenCalledTimes(2);
    expect(messagesFetchSpy).toHaveBeenCalledTimes(2);
    expect(messageReplySpy).toHaveBeenCalledTimes(1);
    expect(messageEditSpy).toHaveBeenCalledTimes(2);
    expect(channelsFetchSpy).toHaveBeenNthCalledWith(1, '123456789');
    expect(channelsFetchSpy).toHaveBeenNthCalledWith(2, '123123123123123123');
    expect(messagesFetchSpy).toHaveBeenNthCalledWith(1, '567890123');
    expect(messagesFetchSpy).toHaveBeenNthCalledWith(2, '987654321');

    expect(messageReplySpy).toHaveBeenNthCalledWith(1, {
      embeds: [
        new MessageEmbed()
          .setTitle('Sweep')
          .setURL(`https://etherscan.io/tx/${BYTES32_FIXTURE}`)
          .setDescription(
            '✅ Transaction succeeded for *How much in punks should we sweep?*.'
          ),
      ],
    });

    expect(messageEditSpy).toHaveBeenNthCalledWith(1, {
      components: [],
    });

    expect(messageEditSpy).toHaveBeenNthCalledWith(2, {
      components: [],
      embeds: [
        new MessageEmbed().setDescription(
          '[✅ Transaction succeeded](https://etherscan.io/tx/0xfe837a5e727dacac34d8070a94918f13335f255f9bbf958d876718aac64b299d)'
        ),
      ],
    });

    // Cleanup

    channelsFetchSpy.mockRestore();
    daosSpy.mockRestore();
    discordClientSpy.mockRestore();
    floorSweeperPollSpy.mockRestore();
  });

  test('should notify Discord when a failed transaction is sent', async () => {
    const messagesFetchSpy = jest.fn().mockImplementation(async () => ({
      edit: messageEditSpy,
      reply: messageReplySpy,
    }));

    const channelsFetchSpy = jest.fn().mockImplementation(async () => ({
      messages: {
        fetch: messagesFetchSpy,
      },
    }));

    const discordClientSpy = jest
      .spyOn(await import('../getTributeToolsClient'), 'getTributeToolsClient')
      .mockImplementation(async () => ({
        client: {
          channels: {
            fetch: channelsFetchSpy,
          },
        } as any,
        stop: async () => undefined,
      }));

    const floorSweeperPollSpy = (
      prismaMock.floorSweeperPoll as any
    ).findUnique.mockResolvedValue(SWEEP_DB_ENTRY);

    const daosSpy = await mockDaosHelper();
    const messageEditSpy = jest.fn();
    const messageReplySpy = jest.fn();

    const result = await notifyPollTxStatus({
      data: {
        id: UUID_FIXTURE,
        type: TributeToolsWebhookTxType.SWEEP,
        tx: {
          hash: BYTES32_FIXTURE,
          status: TributeToolsWebhookTxStatus.FAILED,
        },
      },
    });

    expect(floorSweeperPollSpy).toHaveBeenCalledTimes(1);

    expect(floorSweeperPollSpy).toHaveBeenNthCalledWith(1, {
      where: {
        uuid: UUID_FIXTURE,
      },
    });

    expect(result).toBe(undefined);
    expect(channelsFetchSpy).toHaveBeenCalledTimes(2);
    expect(messagesFetchSpy).toHaveBeenCalledTimes(2);
    expect(messageReplySpy).toHaveBeenCalledTimes(1);
    expect(channelsFetchSpy).toHaveBeenNthCalledWith(1, '123456789');
    expect(messagesFetchSpy).toHaveBeenNthCalledWith(1, '567890123');

    expect(messageReplySpy).toHaveBeenNthCalledWith(1, {
      embeds: [
        new MessageEmbed()
          .setTitle('Sweep')
          .setURL(`https://etherscan.io/tx/${BYTES32_FIXTURE}`)
          .setDescription(
            '❌ Transaction failed for *How much in punks should we sweep?*.'
          ),
      ],
    });

    expect(messageEditSpy).toHaveBeenNthCalledWith(1, {
      embeds: [
        new MessageEmbed().setDescription(
          '[❌ Transaction failed](https://etherscan.io/tx/0xfe837a5e727dacac34d8070a94918f13335f255f9bbf958d876718aac64b299d)'
        ),
      ],
    });

    // Cleanup

    channelsFetchSpy.mockRestore();
    daosSpy.mockRestore();
    discordClientSpy.mockRestore();
    floorSweeperPollSpy.mockRestore();
  });

  test('should notify Discord when a `/buy` transaction is sent', async () => {
    const messagesFetchSpy = jest.fn().mockImplementation(async () => ({
      edit: messageEditSpy,
      reply: messageReplySpy,
    }));

    const channelsFetchSpy = jest.fn().mockImplementation(async () => ({
      messages: {
        fetch: messagesFetchSpy,
      },
    }));

    const discordClientSpy = jest
      .spyOn(await import('../getTributeToolsClient'), 'getTributeToolsClient')
      .mockImplementation(async () => ({
        client: {
          channels: {
            fetch: channelsFetchSpy,
          },
        } as any,
        stop: async () => undefined,
      }));

    const buyPollSpy = (
      prismaMock.buyNFTPoll as any
    ).findUnique.mockResolvedValue(BUY_DB_ENTRY);

    const daosSpy = await mockDaosHelper();
    const messageEditSpy = jest.fn();
    const messageReplySpy = jest.fn();

    await notifyPollTxStatus({
      data: {
        id: UUID_FIXTURE,
        type: TributeToolsWebhookTxType.BUY,
        tx: {
          hash: BYTES32_FIXTURE,
          status: TributeToolsWebhookTxStatus.SUCCESS,
        },
      },
    });

    expect(messageReplySpy).toHaveBeenCalledTimes(1);

    expect(messageReplySpy).toHaveBeenNthCalledWith(1, {
      embeds: [
        new MessageEmbed()
          .setTitle('Buy')
          .setURL(`https://etherscan.io/tx/${BYTES32_FIXTURE}`)
          .setDescription(
            '✅ Transaction succeeded for *Should we buy Dexter Funky Xavier?*.'
          ),
      ],
    });

    // Cleanup

    channelsFetchSpy.mockRestore();
    daosSpy.mockRestore();
    discordClientSpy.mockRestore();
    buyPollSpy.mockRestore();
  });

  test('should notify Discord when a `/fund` transaction is sent', async () => {
    const messagesFetchSpy = jest.fn().mockImplementation(async () => ({
      edit: messageEditSpy,
      reply: messageReplySpy,
    }));

    const channelsFetchSpy = jest.fn().mockImplementation(async () => ({
      messages: {
        fetch: messagesFetchSpy,
      },
    }));

    const discordClientSpy = jest
      .spyOn(await import('../getTributeToolsClient'), 'getTributeToolsClient')
      .mockImplementation(async () => ({
        client: {
          channels: {
            fetch: channelsFetchSpy,
          },
        } as any,
        stop: async () => undefined,
      }));

    const fundPollSpy = (
      prismaMock.fundAddressPoll as any
    ).findUnique.mockResolvedValue(FUND_DB_ENTRY);

    const daosSpy = await mockDaosHelper();
    const messageEditSpy = jest.fn();
    const messageReplySpy = jest.fn();

    await notifyPollTxStatus({
      data: {
        id: UUID_FIXTURE,
        type: TributeToolsWebhookTxType.FUND,
        tx: {
          hash: BYTES32_FIXTURE,
          status: TributeToolsWebhookTxStatus.SUCCESS,
        },
      },
    });

    expect(messageReplySpy).toHaveBeenCalledTimes(1);

    expect(messageReplySpy).toHaveBeenNthCalledWith(1, {
      embeds: [
        new MessageEmbed()
          .setTitle('Fund')
          .setURL(`https://etherscan.io/tx/${BYTES32_FIXTURE}`)
          .setDescription(
            '✅ Transaction succeeded for *Seed round for Tribute Labs*.'
          ),
      ],
    });

    // Cleanup

    channelsFetchSpy.mockRestore();
    daosSpy.mockRestore();
    discordClientSpy.mockRestore();
    fundPollSpy.mockRestore();
  });

  test('should throw error when no `actionMessageID` found', async () => {
    const messagesFetchSpy = jest.fn().mockImplementation(async () => ({
      edit: messageEditSpy,
      reply: messageReplySpy,
    }));

    const channelsFetchSpy = jest.fn().mockImplementation(async () => ({
      messages: {
        fetch: messagesFetchSpy,
      },
    }));

    const discordClientSpy = jest
      .spyOn(await import('../getTributeToolsClient'), 'getTributeToolsClient')
      .mockImplementation(async () => ({
        client: {
          channels: {
            fetch: channelsFetchSpy,
          },
        } as any,
        stop: async () => undefined,
      }));

    const buyPollSpy = (
      prismaMock.buyNFTPoll as any
    ).findUnique.mockResolvedValue(BUY_DB_ENTRY);

    const daosSpy = await mockDaosHelper();
    const messageEditSpy = jest.fn();
    const messageReplySpy = jest.fn();

    try {
      await notifyPollTxStatus({
        data: {
          id: UUID_FIXTURE,
          type: TributeToolsWebhookTxType.BUY,
          tx: {
            hash: BYTES32_FIXTURE,
            status: TributeToolsWebhookTxStatus.SUCCESS,
          },
        },
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);

      expect((error as any)?.message).toMatch(
        /No `actionMessageID` was found\./i
      );
    }

    // Cleanup

    buyPollSpy.mockRestore();
    channelsFetchSpy.mockRestore();
    daosSpy.mockRestore();
    discordClientSpy.mockRestore();
  });

  test('should throw error when no `actionChannelID` found', async () => {
    const messagesFetchSpy = jest.fn().mockImplementation(async () => ({
      edit: messageEditSpy,
      reply: messageReplySpy,
    }));

    const channelsFetchSpy = jest.fn().mockImplementation(async () => ({
      messages: {
        fetch: messagesFetchSpy,
      },
    }));

    const discordClientSpy = jest
      .spyOn(await import('../getTributeToolsClient'), 'getTributeToolsClient')
      .mockImplementation(async () => ({
        client: {
          channels: {
            fetch: channelsFetchSpy,
          },
        } as any,
        stop: async () => undefined,
      }));

    const buyPollSpy = (
      prismaMock.buyNFTPoll as any
    ).findUnique.mockResolvedValue(BUY_DB_ENTRY);

    const getDaos = await import('../../../services/dao/getDaos');

    const daosSpy = jest
      .spyOn(getDaos, 'getDaos')
      .mockImplementationOnce(async () => ({}));

    const messageEditSpy = jest.fn();
    const messageReplySpy = jest.fn();

    try {
      await notifyPollTxStatus({
        data: {
          id: UUID_FIXTURE,
          type: TributeToolsWebhookTxType.BUY,
          tx: {
            hash: BYTES32_FIXTURE,
            status: TributeToolsWebhookTxStatus.SUCCESS,
          },
        },
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);

      expect((error as any)?.message).toMatch(
        /No `actionChannelID` was found\./i
      );
    }

    // Cleanup

    buyPollSpy.mockRestore();
    channelsFetchSpy.mockRestore();
    daosSpy.mockRestore();
    discordClientSpy.mockRestore();
  });

  test('should throw error when no db entry found', async () => {
    const messagesFetchSpy = jest.fn().mockImplementation(async () => ({
      edit: messageEditSpy,
      reply: messageReplySpy,
    }));

    const channelsFetchSpy = jest.fn().mockImplementation(async () => ({
      messages: {
        fetch: messagesFetchSpy,
      },
    }));

    const discordClientSpy = jest
      .spyOn(await import('../getTributeToolsClient'), 'getTributeToolsClient')
      .mockImplementation(async () => ({
        client: {
          channels: {
            fetch: channelsFetchSpy,
          },
        } as any,
        stop: async () => undefined,
      }));

    const buyPollSpy = (
      prismaMock.buyNFTPoll as any
    ).findUnique.mockResolvedValue(undefined);

    const daosSpy = await mockDaosHelper();
    const messageEditSpy = jest.fn();
    const messageReplySpy = jest.fn();

    try {
      await notifyPollTxStatus({
        data: {
          id: UUID_FIXTURE,
          type: TributeToolsWebhookTxType.BUY,
          tx: {
            hash: BYTES32_FIXTURE,
            status: TributeToolsWebhookTxStatus.SUCCESS,
          },
        },
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);

      expect((error as any)?.message).toMatch(
        /No DB entry was found for type `singleBuy`, UUID `02458ff0-4cc5-4137-bcf5-ef91053ab811`\./i
      );
    }

    // Cleanup

    buyPollSpy.mockRestore();
    channelsFetchSpy.mockRestore();
    daosSpy.mockRestore();
    discordClientSpy.mockRestore();
  });

  test('should throw error when wrong type is passed', async () => {
    const messagesFetchSpy = jest.fn().mockImplementation(async () => ({
      edit: messageEditSpy,
      reply: messageReplySpy,
    }));

    const channelsFetchSpy = jest.fn().mockImplementation(async () => ({
      messages: {
        fetch: messagesFetchSpy,
      },
    }));

    const discordClientSpy = jest
      .spyOn(await import('../getTributeToolsClient'), 'getTributeToolsClient')
      .mockImplementation(async () => ({
        client: {
          channels: {
            fetch: channelsFetchSpy,
          },
        } as any,
        stop: async () => undefined,
      }));

    const buyPollSpy = (
      prismaMock.buyNFTPoll as any
    ).findUnique.mockResolvedValue(undefined);

    const daosSpy = await mockDaosHelper();
    const messageEditSpy = jest.fn();
    const messageReplySpy = jest.fn();

    try {
      await notifyPollTxStatus({
        data: {
          id: UUID_FIXTURE,
          // Use incorrect type
          type: 'BAD' as any,
          tx: {
            hash: BYTES32_FIXTURE,
            status: TributeToolsWebhookTxStatus.SUCCESS,
          },
        },
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);

      expect((error as any)?.message).toMatch(
        /No DB entry was found for type `BAD`, UUID `02458ff0-4cc5-4137-bcf5-ef91053ab811`\./i
      );
    }

    // Cleanup

    buyPollSpy.mockRestore();
    channelsFetchSpy.mockRestore();
    daosSpy.mockRestore();
    discordClientSpy.mockRestore();
  });

  test('should throw error when db find fails', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation((m) => m);

    const messagesFetchSpy = jest.fn().mockImplementation(async () => ({
      edit: messageEditSpy,
      reply: messageReplySpy,
    }));

    const channelsFetchSpy = jest.fn().mockImplementation(async () => ({
      messages: {
        fetch: messagesFetchSpy,
      },
    }));

    const discordClientSpy = jest
      .spyOn(await import('../getTributeToolsClient'), 'getTributeToolsClient')
      .mockImplementation(async () => ({
        client: {
          channels: {
            fetch: channelsFetchSpy,
          },
        } as any,
        stop: async () => undefined,
      }));

    const buyPollSpy = (
      prismaMock.buyNFTPoll as any
    ).findUnique.mockImplementation(() => {
      throw new Error('Some bad db error.');
    });

    const daosSpy = await mockDaosHelper();
    const messageEditSpy = jest.fn();
    const messageReplySpy = jest.fn();

    try {
      await notifyPollTxStatus({
        data: {
          id: UUID_FIXTURE,
          type: TributeToolsWebhookTxType.BUY,
          tx: {
            hash: BYTES32_FIXTURE,
            status: TributeToolsWebhookTxStatus.SUCCESS,
          },
        },
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);

      expect((error as any)?.message).toMatch(
        /Something went wrong while getting the data for type `singleBuy` uuid `02458ff0-4cc5-4137-bcf5-ef91053ab811`\./i
      );
    }

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    expect(consoleErrorSpy).toHaveBeenNthCalledWith(
      1,
      new Error('Some bad db error.')
    );

    // Cleanup

    buyPollSpy.mockRestore();
    channelsFetchSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    daosSpy.mockRestore();
    discordClientSpy.mockRestore();
  });
});
