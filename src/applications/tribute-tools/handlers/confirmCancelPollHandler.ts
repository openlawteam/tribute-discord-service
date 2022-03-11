import {
  BuyNFTPoll,
  FloorSweeperPoll,
  FundAddressPoll,
  Prisma,
} from '@prisma/client';
import {Interaction, MessageEmbed, TextChannel} from 'discord.js';

import {APPLICATION_COMMANDS} from '../../../config';
import {getDaoDataByGuildID} from '../../../helpers';
import {getDaos} from '../../../services';
import {getTributeToolsClient} from '..';
import {prisma} from '../../../singletons';

type ApplicationCommands = typeof APPLICATION_COMMANDS[number];

const CUSTOM_ID_REGEX: RegExp = new RegExp(
  `^confirmCancelPoll-(${APPLICATION_COMMANDS.join('|')})-.+$`
);

async function setCancelDB({
  applicationCommandName,
  messageID,
}: {
  applicationCommandName: ApplicationCommands;
  messageID: string;
}): Promise<
  | ReturnType<
      | typeof prisma.buyNFTPoll.update
      | typeof prisma.floorSweeperPoll.update
      | typeof prisma.fundAddressPoll.update
    >
  | null
  | undefined
> {
  try {
    switch (applicationCommandName) {
      case 'BUY':
        return await prisma.buyNFTPoll.update({
          data: {isCancelled: true},
          where: {messageID},
        });

      case 'FUND':
        return await prisma.fundAddressPoll.update({
          data: {isCancelled: true},
          where: {messageID},
        });

      case 'SWEEP':
        return await prisma.floorSweeperPoll.update({
          data: {isCancelled: true},
          where: {messageID},
        });

      default:
        return undefined;
    }
  } catch (error) {
    console.error(error);

    /**
     * Handle return if record does not exist
     *
     * @see https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
     */
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error?.code === 'P2025') {
        return null;
      }
    }

    throw new Error(
      `Something went wrong while saving the transaction data for command type \`${applicationCommandName}\`, \`messageID\` \`${messageID}\`.`
    );
  }
}

function getPollTitle({
  applicationCommandName,
  pollEntry,
}: {
  applicationCommandName: ApplicationCommands;
  pollEntry: BuyNFTPoll | FloorSweeperPoll | FundAddressPoll;
}): string | undefined {
  try {
    switch (applicationCommandName) {
      case 'BUY':
        return (pollEntry as BuyNFTPoll).name;

      case 'FUND':
        return (pollEntry as FundAddressPoll).purpose;

      case 'SWEEP':
        return (pollEntry as FloorSweeperPoll).question;

      default:
        throw new Error(
          `Could not find \`APPLICATION_COMMANDS\`: \`${applicationCommandName}\`.`
        );
    }
  } catch (error) {
    console.error(error);

    throw new Error(
      `Something went wrong while getting the poll title for application command \`${applicationCommandName}\`.`
    );
  }
}

export async function confirmCancelPollHandler(
  interaction: Interaction
): Promise<void> {
  // If the interaction is not from a button, exit.
  if (!interaction.isButton()) return;

  const {customId} = interaction;

  // If the pattern of the Discord button's `customId` does not match, exit.
  if (!CUSTOM_ID_REGEX.test(customId)) return;

  try {
    const [_, command, messageID] = customId.split('-');
    const applicationCommandName = command as ApplicationCommands;

    // Store data in database
    const pollEntry = await setCancelDB({applicationCommandName, messageID});

    if (!pollEntry) {
      throw new Error(
        `No poll entry was found for command type \`${applicationCommandName}\`, \`messageID\` \`${messageID}\`.`
      );
    }

    const {client} = await getTributeToolsClient();

    // Get channel the poll is in
    const pollChannel = (await client.channels.fetch(
      pollEntry.channelID
    )) as TextChannel;

    // Get poll Discord message
    const pollMessage = await pollChannel.messages.fetch(messageID);

    const pollTitle = getPollTitle({
      applicationCommandName,
      pollEntry,
    });

    // After replying, delete the original poll
    await pollMessage.delete();

    // Edit the ephemeral "cancel" interaction
    await interaction.update({
      // Remove any action buttons
      components: [],
      content: `You've removed the poll, *${pollTitle}*.`,
    });

    // Reply publicly that the original poll message has been deleted
    await interaction.followUp({
      content: `The following poll has been cancelled and removed: *${pollTitle}*.`,
    });

    // If the poll is already processed, then we need to update the action channel's message.
    if (pollEntry.processed) {
      if (!pollEntry.actionMessageID) return;

      const dao = getDaoDataByGuildID(pollEntry.guildID, await getDaos());

      if (!dao) return;

      const resultChannelID =
        dao?.applications?.TRIBUTE_TOOLS_BOT?.commands[applicationCommandName]
          .resultChannelID;

      if (!resultChannelID) return;

      // Get channel the action button is in
      const pollChannel = (await client.channels.fetch(
        resultChannelID
      )) as TextChannel;

      // Get poll Discord message
      const pollMessage = await pollChannel.messages.fetch(
        pollEntry.actionMessageID
      );

      const actionStatusEmbed = new MessageEmbed().setDescription(
        '⛔️ Poll cancelled'
      );

      // Edit the original action message to show the cancelled status
      await pollMessage.edit({
        // Removes button
        components: [],
        embeds: [actionStatusEmbed],
      });
    }
  } catch (error) {
    console.error(error);

    try {
      await interaction.reply({
        content: `There was an error while trying to cancel the poll.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
    }
  }
}
