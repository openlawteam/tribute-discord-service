import {CommandInteraction, Message, MessageEmbed} from 'discord.js';
import {isAddress, fromWei, toBN} from 'web3-utils';
import {SlashCommandBuilder} from '@discordjs/builders';
import {URL} from 'url';
import fetch from 'node-fetch';

import {Command} from '../../types';
import {getDaoDataByGuildID, getEnv} from '../../../helpers';
import {getDaos} from '../../../services';
import {getVoteThreshold} from '../helpers';
import {prisma} from '../../../singletons';
import {THUMBS_EMOJIS} from '../config';

const COMMAND_NAME: string = 'buy';

const COMMAND_DESCRIPTION: string = 'Creates a poll for buying a single NFT.';

const ARG_NAMES = {
  url: 'url',
};

const INVALID_URL_ERROR_MESSAGE: string = 'The URL is invalid.';

const INVALID_URL_HOST_ERROR_MESSAGE: string =
  'The URL host is not approved. Currently supported: OpenSea, Gem.';

const BAD_PARSE_ERROR_MESSAGE: string =
  "Could not get the NFT's information. Please check the URL.";

const MISSING_ASSET_DATA_ERROR_MESSAGE: string =
  "The NFT's data was returned incomplete.";

const POLL_SETUP_ERROR_MESSAGE: string =
  'Something went wrong while setting up the poll.';

const NO_PRICE_ERROR_MESSAGE: string =
  'Asset has no price information in Gem. It may be a brand new listing, or not for sale?';

const NO_GEM_API_KEY_ERROR_MESSAGE: string =
  'A required Gem API key was not found.';

function isValidURL(url: string): boolean {
  try {
    new URL(url);
  } catch (error) {
    return false;
  }

  return true;
}

function isValidURLHost(url: string): boolean {
  try {
    const {host} = new URL(url);

    const isGem = /^(www\.)?gem\.xyz/.test(host);
    const isOS = /^(www\.)?opensea\.io/.test(host);

    if (!isGem && !isOS) {
      throw new Error('URL `host` is not valid.');
    }
  } catch (error) {
    return false;
  }

  return true;
}

function parseBuyURL(url: string): {contractAddress: string; tokenID: string} {
  const {pathname} = new URL(url);

  const contractAddress =
    pathname.split(/\//).find((p, i) => i === 2 && isAddress(p)) || '';

  const tokenID =
    pathname
      .split(/\//)
      .find((p, i) => i === 3 && Number.isInteger(parseInt(p))) || '';

  return {contractAddress, tokenID};
}

// Sweep command structure
const command = new SlashCommandBuilder()
  // Position required arguments first for better UX
  .addStringOption((option) =>
    option
      .setName(ARG_NAMES.url)
      .setDescription(
        "Set the NFT's OpenSea or Gem URL. e.g. https://.../0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b/5840"
      )
      .setRequired(true)
  ) // Returning last for type check
  .setName(COMMAND_NAME)
  .setDescription(COMMAND_DESCRIPTION);

/**
 * Sweep command reply logic
 *
 * @param interaction `CommandInteraction`
 * @returns `Promise<void>`
 */
async function execute(interaction: CommandInteraction) {
  const {url: urlArgName} = ARG_NAMES;
  const url: string = interaction.options.getString(urlArgName) || '';

  if (!interaction.isCommand()) {
    return;
  }

  // Validate URL
  if (!isValidURL(url)) {
    // Reply with an error/help message that only the user can see.
    await interaction.reply({
      content: INVALID_URL_ERROR_MESSAGE,
      ephemeral: true,
    });

    return;
  }

  // Validate URL `host`
  if (!isValidURLHost(url)) {
    // Reply with an error/help message that only the user can see.
    await interaction.reply({
      content: INVALID_URL_HOST_ERROR_MESSAGE,
      ephemeral: true,
    });

    return;
  }

  const {contractAddress, tokenID} = parseBuyURL(url);

  // Validate the URL fragments
  if (!contractAddress || !tokenID) {
    // Reply with an error/help message that only the user can see.
    await interaction.reply({
      content: BAD_PARSE_ERROR_MESSAGE,
      ephemeral: true,
    });

    return;
  }

  const GEM_API_KEY = getEnv('GEM_API_KEY');

  if (!GEM_API_KEY) {
    // Reply with an error/help message that only the user can see.
    await interaction.reply({
      content: NO_GEM_API_KEY_ERROR_MESSAGE,
      ephemeral: true,
    });

    return;
  }

  const assetResponse = await fetch(
    'https://gem-public-api.herokuapp.com/assets',
    {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': GEM_API_KEY,
      },
      body: JSON.stringify({
        filters: {
          tokenIds: [tokenID],
          address: contractAddress,
        },
        /**
         * Not sure why removing some of these fields causes nothing to return?
         * Leaving as is, for now.
         */
        fields: {
          address: 1,
          animationUrl: 1,
          collectionName: 1,
          collectionSymbol: 1,
          creator: 1,
          currentBasePrice: 1,
          decimals: 1,
          ethReserves: 1,
          externalLink: 1,
          id: 1,
          imageUrl: 1,
          market: 1,
          marketplace: 1,
          marketUrl: 1,
          name: 1,
          owner: 1,
          paymentToken: 1,
          priceInfo: 1,
          rarityScore: 1,
          sellOrders: 1,
          smallImageUrl: 1,
          standard: 1,
          tokenId: 1,
          tokenReserves: 1,
          traits: 1,
          url: 1,
        },
        offset: 0,
        limit: 1,
        status: ['all'],
      }),
      method: 'POST',
    }
  );

  // Check Gem response
  if (!assetResponse.ok) {
    // Reply with an error/help message that only the user can see.
    await interaction.reply({
      content: POLL_SETUP_ERROR_MESSAGE,
      ephemeral: true,
    });

    return;
  }

  const assetResponseJSON = await assetResponse.json();

  const {name, priceInfo, smallImageUrl} = assetResponseJSON?.data?.[0] || {};

  // Validate the NFT price - it may be a brand new listing (e.g. <= ~15min old)
  if (!priceInfo) {
    // Reply with an error/help message that only the user can see.
    await interaction.reply({
      content: NO_PRICE_ERROR_MESSAGE,
      ephemeral: true,
    });

    return;
  }

  // Validate required information
  if (!name || !smallImageUrl) {
    // Reply with an error/help message that only the user can see.
    await interaction.reply({
      content: MISSING_ASSET_DATA_ERROR_MESSAGE,
      ephemeral: true,
    });

    return;
  }

  // Gem UI asset URL does not get returned, currently.
  const gemAssetURL: string = `https://www.gem.xyz/asset/${contractAddress}/${tokenID}`;
  const price = fromWei(toBN(priceInfo.price), 'ether');
  const dao = getDaoDataByGuildID(interaction.guildId || '', await getDaos());

  if (!dao) {
    // Reply with an error/help message that only the user can see.
    await interaction.reply({
      content: POLL_SETUP_ERROR_MESSAGE,
      ephemeral: true,
    });

    return;
  }

  const voteThreshold = getVoteThreshold({
    amount: price,
    thresholds:
      dao.applications?.TRIBUTE_TOOLS_BOT?.commands.BUY.voteThresholds,
  });

  const embed = new MessageEmbed()
    .setTitle(name)
    .setDescription(
      `📊 **Should we buy it for ${price} ETH?**\n\u200B`
    ) /* `\u200B` = zero-width space */
    .setURL(gemAssetURL)
    .addFields({
      name: 'Vote Threshold',
      value: `${voteThreshold} upvote${voteThreshold > 1 ? 's' : ''}`,
    })
    .setImage(smallImageUrl)
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
        `No \`guildId\` was found on \`Message\` ${messageID}. Channel: ${channelID}. Asset: ${name}.`
      );
    }

    // Store poll data in DB
    await prisma.buyNFTPoll.create({
      data: {
        channelID,
        contractAddress,
        guildID,
        messageID,
        name,
        tokenID,
        voteThreshold,
      },
    });

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
export const buy: Command = {
  data: command,
  execute,
};
