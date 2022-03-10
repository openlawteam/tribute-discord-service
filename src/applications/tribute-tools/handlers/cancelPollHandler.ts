import {Interaction, MessageActionRow, MessageButton} from 'discord.js';

import {
  CANCEL_POLL_BUY_CUSTOM_ID,
  CANCEL_POLL_FUND_CUSTOM_ID,
  CANCEL_POLL_SWEEP_CUSTOM_ID,
} from '../config';
import {APPLICATION_COMMANDS} from '../../../config';
import {prisma} from '../../../singletons';

type ApplicationCommands = typeof APPLICATION_COMMANDS[number];

type ConfirmCancelPollCustomID =
  `confirmCancelPoll-${ApplicationCommands}-${string}`;

function getCommandFromCustomID(
  customId: string
): ApplicationCommands | undefined {
  switch (customId) {
    case CANCEL_POLL_BUY_CUSTOM_ID:
      return 'BUY';
    case CANCEL_POLL_FUND_CUSTOM_ID:
      return 'FUND';
    case CANCEL_POLL_SWEEP_CUSTOM_ID:
      return 'SWEEP';
    default:
      return undefined;
  }
}

async function getPollTitle({
  applicationCommandName,
  messageID,
}: {
  applicationCommandName: ApplicationCommands;
  messageID: string;
}): Promise<string | undefined> {
  try {
    switch (applicationCommandName) {
      case 'BUY':
        return (
          await prisma.buyNFTPoll.findUnique({
            where: {messageID},
          })
        )?.name;

      case 'FUND':
        return (
          await prisma.fundAddressPoll.findUnique({
            where: {messageID},
          })
        )?.purpose;

      case 'SWEEP':
        return (
          await prisma.floorSweeperPoll.findUnique({
            where: {messageID},
          })
        )?.question;

      default:
        throw new Error(
          `Could not find \`APPLICATION_COMMANDS\`: \`${applicationCommandName}\`.`
        );
    }
  } catch (error) {
    console.error(error);

    throw new Error(
      `Something went wrong while getting the poll data for application command \`${applicationCommandName}\`.`
    );
  }
}

export async function cancelPollHandler(
  interaction: Interaction
): Promise<void> {
  // If the interaction is not from a button, exit.
  if (!interaction.isButton()) return;

  const applicationCommandName = getCommandFromCustomID(interaction.customId);

  // If no matching `customId` is found, exit.
  if (!applicationCommandName) return;

  try {
    const messageID: string = interaction.message.id;

    const pollTitle = await getPollTitle({applicationCommandName, messageID});

    if (!pollTitle) {
      throw new Error(
        `No poll title was found for message \`${messageID}\` in guild \`${interaction.guildId}\`.`
      );
    }

    const customId: ConfirmCancelPollCustomID = `confirmCancelPoll-${applicationCommandName}-${messageID}`;

    const confirmCancelButton = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId(customId)
        .setLabel('Cancel poll')
        .setStyle('DANGER')
    );

    // Respond with a confirmation message and button
    await interaction.reply({
      components: [confirmCancelButton],
      content: `You're about to cancel and remove the poll, *${pollTitle}*`,
      ephemeral: true,
    });
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
