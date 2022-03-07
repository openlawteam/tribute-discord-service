import {BuyNFTPoll, FloorSweeperPoll, FundAddressPoll} from '@prisma/client';
import {Client, MessageEmbed, TextChannel} from 'discord.js';

import {
  TributeToolsWebhookPayload,
  TributeToolsWebhookTxStatus,
  TributeToolsWebhookTxType,
} from '../../../http-api/types';
import {APPLICATION_COMMANDS} from '../../../config';
import {getDaoDataByGuildID} from '../../../helpers';
import {getDaos} from '../../../services';

const TX_SUCCEEDED_MESSAGE: string = '✅ Transaction succeeded';
const TX_FAILED_MESSAGE: string = '❌ Transaction failed';

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
      return `${TX_SUCCEEDED_MESSAGE} for *${name}*.`;

    case TributeToolsWebhookTxStatus.FAILED:
      return `${TX_FAILED_MESSAGE} for *${name}*.`;

    default:
      throw new Error(`\`status\` ${status} was not found.`);
  }
}

function getCommand(
  type: TributeToolsWebhookTxType
): typeof APPLICATION_COMMANDS[number] {
  switch (type) {
    case TributeToolsWebhookTxType.BUY:
      return 'BUY';
    case TributeToolsWebhookTxType.FUND:
      return 'FUND';
    case TributeToolsWebhookTxType.SWEEP:
      return 'SWEEP';
    default:
      throw new Error(`\`type\` ${type} was not found.`);
  }
}

export async function notifyPollTxStatus({
  client,
  dbEntry,
  payload,
}: {
  client: Client;
  dbEntry: FloorSweeperPoll | FundAddressPoll | BuyNFTPoll;
  payload: TributeToolsWebhookPayload;
}): Promise<void> {
  const {actionMessageID, channelID, guildID, messageID, txHash} = dbEntry;

  const {
    data: {
      tx: {status},
      type,
    },
  } = payload;

  try {
    const pollChannel = (await client.channels.fetch(channelID)) as TextChannel;
    const pollMessage = await pollChannel.messages.fetch(messageID);

    const title = getTitle(type);
    const name = getName({dbEntry, type});
    const description = getStatus({name, status});
    const etherscanURL: string = `https://etherscan.io/tx/${txHash}`;

    const pollStatusEmbed = new MessageEmbed()
      .setTitle(title)
      .setURL(etherscanURL)
      .setDescription(description);

    // Notify poll channel of the related tx's status
    await pollMessage.reply({
      embeds: [pollStatusEmbed],
    });

    if (!actionMessageID) {
      throw new Error(`No \`actionMessageID\` was found.`);
    }

    const txSucceeded: boolean = status === TributeToolsWebhookTxStatus.SUCCESS;
    const dao = getDaoDataByGuildID(guildID, await getDaos());
    const command = getCommand(type);

    const actionChannelID =
      dao?.applications?.TRIBUTE_TOOLS_BOT?.commands[command].resultChannelID;

    if (!actionChannelID) {
      throw new Error(`No \`actionChannelID\` was found.`);
    }

    const actionChannel = (await client.channels.fetch(
      actionChannelID
    )) as TextChannel;

    const actionMessage = await actionChannel.messages.fetch(actionMessageID);

    const statusText: string = txSucceeded
      ? `[${TX_SUCCEEDED_MESSAGE}](${etherscanURL})`
      : `[${TX_FAILED_MESSAGE}](${etherscanURL})`;

    const actionStatusEmbed = new MessageEmbed().setDescription(statusText);

    // Edit the original action message to show the related tx's status
    await actionMessage.edit({
      // Removes button, if tx succeeded
      ...(txSucceeded ? {components: []} : null),
      embeds: [actionStatusEmbed],
    });
  } catch (error) {
    throw error;
  }
}
