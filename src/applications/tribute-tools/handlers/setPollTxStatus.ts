import {Client, MessageEmbed, TextChannel} from 'discord.js';
import {
  BuyNFTPoll,
  FloorSweeperPoll,
  FundAddressPoll,
  TributeToolsTxStatus,
} from '@prisma/client';

import {
  TributeToolsWebhookPayload,
  TributeToolsWebhookTxStatus,
  TributeToolsWebhookTxType,
} from '../../../http-api/types';

type SetPollTxStatusParams = {
  channelID: string;
  client: Client;
  messageID: string;
  txHash: string;
  txStatus: TributeToolsWebhookTxStatus;
  type: TributeToolsWebhookTxType;
};

function getTitle(type: TributeToolsWebhookTxType): 'Buy' | 'Sweep' | 'Fund' {
  switch (type) {
    case TributeToolsWebhookTxType.BUY:
      return 'Buy';

    case TributeToolsWebhookTxType.FUND:
      return 'Fund';

    case TributeToolsWebhookTxType.SWEEP:
      return 'Sweep';

    default:
      throw new Error(`\`type\` ${type} was not found.`);
  }
}

function getName({
  dbEntry,
  type,
}: {
  dbEntry: FloorSweeperPoll | FundAddressPoll | BuyNFTPoll;
  type: TributeToolsWebhookTxType;
}): string {
  switch (type) {
    case TributeToolsWebhookTxType.BUY:
      return (dbEntry as BuyNFTPoll).name;

    case TributeToolsWebhookTxType.FUND:
      return (dbEntry as FundAddressPoll).purpose;

    case TributeToolsWebhookTxType.SWEEP:
      return (dbEntry as FloorSweeperPoll).question;

    default:
      throw new Error(`\`type\` ${type} was not found.`);
  }
}

function getStatus({
  name,
  status,
}: {
  name: string;
  status: TributeToolsWebhookTxStatus;
}): string {
  switch (status) {
    case TributeToolsWebhookTxStatus.SUCCESS:
      return `✅ Transaction succeeded for *${name}*.`;

    case TributeToolsWebhookTxStatus.FAILED:
      return `❌ Transaction failed for *${name}*.`;

    default:
      throw new Error(`\`status\` ${status} was not found.`);
  }
}

export async function setPollTxStatus({
  client,
  dbEntry,
  payload,
}: {
  client: Client;
  dbEntry: FloorSweeperPoll | FundAddressPoll | BuyNFTPoll;
  payload: TributeToolsWebhookPayload;
}): Promise<void> {
  const {channelID, messageID, txHash, txStatus} = dbEntry;
  const {
    data: {
      tx: {status},
      type,
    },
  } = payload;

  try {
    const channel = (await client.channels.fetch(channelID)) as TextChannel;
    const message = await channel.messages.fetch(messageID);

    const title = getTitle(type);
    const name = getName({dbEntry, type});
    const description = getStatus({name, status});

    const pollStatusEmbed = new MessageEmbed()
      .setTitle(title)
      .setURL(`https://etherscan.io/tx/${txHash}`)
      .setDescription(description);

    // Notify poll channel of the related tx's status
    await message.reply({
      embeds: [pollStatusEmbed],
    });
  } catch (error) {
    throw error;
  }
}
