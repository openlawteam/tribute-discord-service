import {
  BuyNFTPoll,
  FloorSweeperPoll,
  FundAddressPoll,
  TributeToolsTxStatus,
} from '@prisma/client';
import {Client, Intents, MessageEmbed} from 'discord.js';

import {
  TributeToolsWebhookTxStatus,
  TributeToolsWebhookTxType,
} from '../../../http-api/types';
import {
  BYTES32_FIXTURE,
  ETH_ADDRESS_FIXTURE,
  GUILD_ID_FIXTURE,
  UUID_FIXTURE,
} from '../../../../test/fixtures';
import {notifyPollTxStatus} from './notifyPollTxStatus';

describe('notifyPollTxStatus unit tests', () => {
  const SWEEP_DB_ENTRY: FloorSweeperPoll = {
    id: 1,
    uuid: UUID_FIXTURE,
    createdAt: new Date(0),
    question: 'How much in punks should we sweep?',
    contractAddress: ETH_ADDRESS_FIXTURE,
    dateEnd: new Date(10000),
    options: {'🇦': 50, '🇧': 100, '🇨': 150, '🚫': 'None'},
    processed: true,
    result: 100,
    guildID: GUILD_ID_FIXTURE,
    channelID: '123456789',
    messageID: '567890123',
    actionMessageID: '987654321',
    txStatus: TributeToolsTxStatus.success,
    txHash: BYTES32_FIXTURE,
  };

  const BUY_DB_ENTRY: BuyNFTPoll = {
    actionMessageID: '987654321',
    channelID: '123456789',
    contractAddress: ETH_ADDRESS_FIXTURE,
    createdAt: new Date(0),
    guildID: GUILD_ID_FIXTURE,
    id: 1,
    messageID: '567890123',
    name: 'Should we buy Dexter Funky Xavier?',
    processed: true,
    tokenID: '123',
    txHash: BYTES32_FIXTURE,
    txStatus: TributeToolsTxStatus.success,
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
    messageID: '567890123',
    processed: true,
    purpose: 'Seed round for Tribute Labs',
    txHash: BYTES32_FIXTURE,
    txStatus: TributeToolsTxStatus.success,
    upvoteCount: 5,
    uuid: UUID_FIXTURE,
    voteThreshold: 5,
  };

  test('should notify Discord when a successful transaction is sent', async () => {
    const client = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      ],
      partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    });

    // `Client` needs a token to make a REST call
    client.token = 'abc123';

    const messagesReplySpy = jest.fn();

    const messagesFetchSpy = jest.fn().mockImplementation(() => ({
      reply: messagesReplySpy,
    }));

    const channelsFetchSpy = jest
      .spyOn(client.channels, 'fetch')
      .mockImplementation(
        () =>
          ({
            messages: {
              fetch: messagesFetchSpy,
            },
          } as any)
      );

    const result = await notifyPollTxStatus({
      client,
      dbEntry: SWEEP_DB_ENTRY,
      payload: {
        data: {
          id: UUID_FIXTURE,
          type: TributeToolsWebhookTxType.SWEEP,
          tx: {
            hash: BYTES32_FIXTURE,
            status: TributeToolsWebhookTxStatus.SUCCESS,
          },
        },
      },
    });

    expect(result).toBe(undefined);
    expect(channelsFetchSpy).toHaveBeenCalledTimes(1);
    expect(messagesFetchSpy).toHaveBeenCalledTimes(1);
    expect(messagesReplySpy).toHaveBeenCalledTimes(1);

    expect(channelsFetchSpy).toHaveBeenNthCalledWith(1, '123456789');
    expect(messagesFetchSpy).toHaveBeenNthCalledWith(1, '567890123');

    expect(messagesReplySpy).toHaveBeenNthCalledWith(1, {
      embeds: [
        new MessageEmbed()
          .setTitle('Sweep')
          .setURL(`https://etherscan.io/tx/${BYTES32_FIXTURE}`)
          .setDescription(
            '✅ Transaction succeeded for *How much in punks should we sweep?*.'
          ),
      ],
    });
  });

  test('should notify Discord when a failed transaction is sent', async () => {
    const client = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      ],
      partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    });

    // `Client` needs a token to make a REST call
    client.token = 'abc123';

    const messagesReplySpy = jest.fn();

    const messagesFetchSpy = jest.fn().mockImplementation(() => ({
      reply: messagesReplySpy,
    }));

    const channelsFetchSpy = jest
      .spyOn(client.channels, 'fetch')
      .mockImplementation(
        () =>
          ({
            messages: {
              fetch: messagesFetchSpy,
            },
          } as any)
      );

    const result = await notifyPollTxStatus({
      client,
      dbEntry: SWEEP_DB_ENTRY,
      payload: {
        data: {
          id: UUID_FIXTURE,
          type: TributeToolsWebhookTxType.SWEEP,
          tx: {
            hash: BYTES32_FIXTURE,
            status: TributeToolsWebhookTxStatus.FAILED,
          },
        },
      },
    });

    expect(result).toBe(undefined);
    expect(channelsFetchSpy).toHaveBeenCalledTimes(1);
    expect(messagesFetchSpy).toHaveBeenCalledTimes(1);
    expect(messagesReplySpy).toHaveBeenCalledTimes(1);

    expect(channelsFetchSpy).toHaveBeenNthCalledWith(1, '123456789');
    expect(messagesFetchSpy).toHaveBeenNthCalledWith(1, '567890123');

    expect(messagesReplySpy).toHaveBeenNthCalledWith(1, {
      embeds: [
        new MessageEmbed()
          .setTitle('Sweep')
          .setURL(`https://etherscan.io/tx/${BYTES32_FIXTURE}`)
          .setDescription(
            '❌ Transaction failed for *How much in punks should we sweep?*.'
          ),
      ],
    });
  });

  test('should notify Discord when a `/buy` transaction is sent', async () => {
    const client = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      ],
      partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    });

    // `Client` needs a token to make a REST call
    client.token = 'abc123';

    const messagesReplySpy = jest.fn();

    const messagesFetchSpy = jest.fn().mockImplementation(() => ({
      reply: messagesReplySpy,
    }));

    const channelsFetchSpy = jest
      .spyOn(client.channels, 'fetch')
      .mockImplementation(
        () =>
          ({
            messages: {
              fetch: messagesFetchSpy,
            },
          } as any)
      );

    const result = await notifyPollTxStatus({
      client,
      dbEntry: BUY_DB_ENTRY,
      payload: {
        data: {
          id: UUID_FIXTURE,
          type: TributeToolsWebhookTxType.BUY,
          tx: {
            hash: BYTES32_FIXTURE,
            status: TributeToolsWebhookTxStatus.SUCCESS,
          },
        },
      },
    });

    expect(result).toBe(undefined);
    expect(channelsFetchSpy).toHaveBeenCalledTimes(1);
    expect(messagesFetchSpy).toHaveBeenCalledTimes(1);
    expect(messagesReplySpy).toHaveBeenCalledTimes(1);

    expect(channelsFetchSpy).toHaveBeenNthCalledWith(1, '123456789');
    expect(messagesFetchSpy).toHaveBeenNthCalledWith(1, '567890123');

    expect(messagesReplySpy).toHaveBeenNthCalledWith(1, {
      embeds: [
        new MessageEmbed()
          .setTitle('Buy')
          .setURL(`https://etherscan.io/tx/${BYTES32_FIXTURE}`)
          .setDescription(
            '✅ Transaction succeeded for *Should we buy Dexter Funky Xavier?*.'
          ),
      ],
    });
  });

  test('should notify Discord when a `/fund` transaction is sent', async () => {
    const client = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      ],
      partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    });

    // `Client` needs a token to make a REST call
    client.token = 'abc123';

    const messagesReplySpy = jest.fn();

    const messagesFetchSpy = jest.fn().mockImplementation(() => ({
      reply: messagesReplySpy,
    }));

    const channelsFetchSpy = jest
      .spyOn(client.channels, 'fetch')
      .mockImplementation(
        () =>
          ({
            messages: {
              fetch: messagesFetchSpy,
            },
          } as any)
      );

    const result = await notifyPollTxStatus({
      client,
      dbEntry: FUND_DB_ENTRY,
      payload: {
        data: {
          id: UUID_FIXTURE,
          type: TributeToolsWebhookTxType.FUND,
          tx: {
            hash: BYTES32_FIXTURE,
            status: TributeToolsWebhookTxStatus.SUCCESS,
          },
        },
      },
    });

    expect(result).toBe(undefined);
    expect(channelsFetchSpy).toHaveBeenCalledTimes(1);
    expect(messagesFetchSpy).toHaveBeenCalledTimes(1);
    expect(messagesReplySpy).toHaveBeenCalledTimes(1);

    expect(channelsFetchSpy).toHaveBeenNthCalledWith(1, '123456789');
    expect(messagesFetchSpy).toHaveBeenNthCalledWith(1, '567890123');

    expect(messagesReplySpy).toHaveBeenNthCalledWith(1, {
      embeds: [
        new MessageEmbed()
          .setTitle('Fund')
          .setURL(`https://etherscan.io/tx/${BYTES32_FIXTURE}`)
          .setDescription(
            '✅ Transaction succeeded for *Seed round for Tribute Labs*.'
          ),
      ],
    });
  });
});
