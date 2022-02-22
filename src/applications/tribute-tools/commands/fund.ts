import {
  CommandInteraction,
  Message,
  MessageEmbed,
  EmbedFooterData,
} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';

import {Command} from '../../types';
import {DEV_COMMAND_NOT_READY} from '../helpers';
import {getDaoDataByGuildID, normalizeString} from '../../../helpers';
import {getDaos} from '../../../services';
import {prisma, web3} from '../../../singletons';
import {THUMBS_EMOJIS} from '../config';

const COMMAND_NAME: string = 'fund';

const COMMAND_DESCRIPTION: string =
  'Creates a poll for funding an Ethereum address in USDC.';

const ARG_NAMES = {
  addressToFund: 'address_to_fund',
  amountUSDC: 'amount_in_usdc',
  purpose: 'purpose',
};

const UPVOTE_THRESHOLD: number = 3;

const POLL_SETUP_ERROR_MESSAGE: string =
  'Something went wrong while setting up the poll.';

const INVALID_ETH_ADDRESS_ERROR_MESSAGE: string =
  'Invalid Ethereum address. Try something like: 0x000000000000000000000000000000000000bEEF.';

// Sweep command structure
const command = new SlashCommandBuilder()
  // Position required arguments first for better UX
  .addStringOption((option) =>
    option
      .setName(ARG_NAMES.addressToFund)
      .setDescription(
        'Set the Ethereum address to fund in USDC. e.g. 0x000000000000000000000000000000000000bEEF'
      )
      .setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName(ARG_NAMES.amountUSDC)
      .setDescription('Set the amount of USDC to fund. e.g. 50000')
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName(ARG_NAMES.purpose)
      .setDescription(
        'Set the purpose of this transaction. e.g. Seed round for XYZ.'
      )
      .setRequired(true)
  )
  // Returning last for type check
  .setName(COMMAND_NAME)
  .setDescription(COMMAND_DESCRIPTION);

/**
 * Sweep command reply logic
 *
 * @param interaction `CommandInteraction`
 * @returns `Promise<void>`
 */
async function execute(interaction: CommandInteraction) {
  const {
    addressToFund: addressToFundArgName,
    amountUSDC: amountUSDCArgName,
    purpose: purposeArgName,
  } = ARG_NAMES;

  const addressToFund: string =
    interaction.options.getString(addressToFundArgName) || '';

  const amountUSDC = interaction.options.getInteger(amountUSDCArgName) || 0;

  const purpose: string = interaction.options.getString(purposeArgName) || '';

  if (!interaction.isCommand()) {
    return;
  }

  // Validate contract address
  if (!web3.utils.isAddress(normalizeString(addressToFund))) {
    // Reply with an error/help message that only the user can see.
    await interaction.reply({
      content: INVALID_ETH_ADDRESS_ERROR_MESSAGE,
      ephemeral: true,
    });

    return;
  }
  const dao = getDaoDataByGuildID(interaction.guildId || '', await getDaos());

  if (!dao) {
    // Reply with an error/help message that only the user can see.
    await interaction.reply({
      content: POLL_SETUP_ERROR_MESSAGE,
      ephemeral: true,
    });

    return;
  }

  const embed = new MessageEmbed()
    .setTitle(purpose)
    .setDescription(
      `${DEV_COMMAND_NOT_READY}\n\n📊 **Should we fund \`${addressToFund}\` for ${new Intl.NumberFormat(
        'en-US',
        {style: 'currency', currency: 'USD'}
      ).format(amountUSDC)} USDC?**\n\u200B`
    ) /* `\u200B` = zero-width space */
    .setURL(`https://etherscan.io/address/${addressToFund}`)
    .addFields({
      name: 'Vote Threshold',
      value: `${UPVOTE_THRESHOLD} upvote${
        UPVOTE_THRESHOLD > 1 ? 's' : ''
      }\n\u200B`,
    })
    .setFooter({
      text: 'After a threshold has been reached the vote is final,\neven if you change your vote.',
    });

  // Reply to user
  const message = (await interaction.reply({
    embeds: [embed],
    fetchReply: true,
  })) as Message;

  try {
    const {guildId: guildID, channelId: channelID, id: messageID} = message;

    if (!guildID) {
      throw new Error(
        `\`/fund\`: No \`guildId\` was found on \`Message\` ${messageID}. Channel: ${channelID}.`
      );
    }

    // @todo Store poll data in DB

    // React with thumbs up, and thumbs down voting buttons as emojis
    const reactionPromises = THUMBS_EMOJIS.map(
      (emoji) => async () => await message.react(emoji)
    );

    // Run sequentially so reactions are in order
    for (const fn of reactionPromises) {
      await fn();
    }
  } catch (error) {
    // Reply with an error/help message that only the user can see.
    await interaction.followUp({
      content: POLL_SETUP_ERROR_MESSAGE,
      ephemeral: true,
    });

    // Delete the original reply as we cannot run a poll without voting buttons
    await message.delete();
  }
}

// Export
export const fund: Command = {
  data: command,
  execute,
};
