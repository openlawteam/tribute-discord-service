import {BuyNFTPoll, FloorSweeperPoll, FundAddressPoll} from '@prisma/client';
import {MessageEmbed, TextChannel} from 'discord.js';

import {
  TributeToolsWebhookPayload,
  TributeToolsWebhookTxStatus,
  TributeToolsWebhookTxType,
} from '../../../http-api/types';
import {APPLICATION_COMMANDS} from '../../../config';
import {getDiscordDataByGuildID} from '../../../helpers';
import {getDaos} from '../../../services';
import {getTributeToolsClient} from '../getTributeToolsClient';
import {prisma} from '../../../singletons';

const TX_SUCCEEDED_MESSAGE: string = '✅ Transaction succeeded';
const TX_FAILED_MESSAGE: string = '❌ Transaction failed';

async function getDBEntry(
  payload: TributeToolsWebhookPayload
): Promise<
  | ReturnType<
      | typeof prisma.buyNFTPoll.findUnique
      | typeof prisma.floorSweeperPoll.findUnique
      | typeof prisma.fundAddressPoll.findUnique
    >
  | null
  | undefined
> {
  const {
    data: {id: uuid, type},
  } = payload;

  try {
    switch (type) {
      case 'fund':
        return await prisma.fundAddressPoll.findUnique({
          where: {uuid},
        });

      case 'singleBuy':
        return await prisma.buyNFTPoll.findUnique({
          where: {uuid},
        });

      case 'sweep':
        return await prisma.floorSweeperPoll.findUnique({
          where: {uuid},
        });

      default:
        return undefined;
    }
  } catch (error) {
    console.error(error);

    throw new Error(
      `Something went wrong while getting the data for type \`${type}\` uuid \`${uuid}\`.`
    );
  }
}

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

export async function notifyPollTxStatus(
  payload: TributeToolsWebhookPayload
): Promise<void> {
  try {
    const {
      data: {
        id,
        tx: {hash, status},
        type,
      },
    } = payload;

    const dbEntry = await getDBEntry(payload);

    if (!dbEntry) {
      throw new Error(
        `No DB entry was found for type \`${type}\`, UUID \`${id}\`.`
      );
    }

    const {client} = await getTributeToolsClient();

    const {actionMessageID, channelID, guildID, messageID} = dbEntry;

    const pollChannel = (await client.channels.fetch(channelID)) as TextChannel;
    const pollMessage = await pollChannel.messages.fetch(messageID);

    const title = getTitle(type);
    const name = getName({dbEntry, type});
    const description = getStatus({name, status});
    const etherscanURL: string = `https://etherscan.io/tx/${hash}`;
    const txSucceeded: boolean = status === TributeToolsWebhookTxStatus.SUCCESS;

    const pollStatusEmbed = new MessageEmbed()
      .setTitle(title)
      .setURL(etherscanURL)
      .setDescription(description);

    // Notify poll channel of the related tx's status
    await pollMessage.reply({
      embeds: [pollStatusEmbed],
    });

    // Edit the poll message to remove the cancel button
    if (txSucceeded) {
      await pollMessage.edit({components: []});
    }

    if (!actionMessageID) {
      throw new Error(`No \`actionMessageID\` was found.`);
    }

    const dao = getDiscordDataByGuildID(guildID, await getDaos());
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
