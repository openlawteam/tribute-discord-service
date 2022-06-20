import {
  CommandInteraction,
  Message,
  MessageActionRow,
  MessageAttachment,
  MessageButton,
  MessageEmbed,
} from 'discord.js';
import {isAddress, fromWei, toBN} from 'web3-utils';
import {SlashCommandBuilder} from '@discordjs/builders';
import {URL} from 'url';
import {z, ZodType} from 'zod';
import fetch from 'node-fetch';
import sharp from 'sharp';

import {CANCEL_POLL_BUY_CUSTOM_ID, THUMBS_EMOJIS} from '../config';
import {Command} from '../../types';
import {getDaoDiscordConfigs} from '../../../services';
import {getDiscordDataByGuildID, getEnv} from '../../../helpers';
import {getVoteThreshold} from '../helpers';
import {prisma} from '../../../singletons';

enum TokenStandard {
  ERC1155 = 'ERC1155',
  ERC721 = 'ERC721',
}

type RequiredGemAssetResponse = z.infer<typeof RequiredGemAssetResponseSchema>;
type RequiredGemRouteResponse = z.infer<typeof RequiredGemRouteResponseSchema>;

const RequiredGemAssetResponseSchema = z.object({
  data: z
    .array(
      z.object({
        address: z.string(),
        name: z.string(),
        smallImageUrl: z.string(),
        standard: z.nativeEnum(TokenStandard),
        tokenId: z.string(),
      })
    )
    .nonempty(),
});

const RequiredGemRouteResponseSchema = z.object({
  route: z
    .array(
      z.object({
        assetIn: z.object({
          amount: z.union([z.string(), z.object({hex: z.string()})]),
        }),
      })
    )
    .nonempty(),
});

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

const GEM_API_BASE_PATH: string = 'https://gem-public-api.herokuapp.com';

const GEM_HOST_REGEX: RegExp = /^(www\.)?gem\.xyz/;
const OPENSEA_HOST_REGEX: RegExp = /^(www\.)?opensea\.io/;

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

    const isGem = GEM_HOST_REGEX.test(host);
    const isOS = OPENSEA_HOST_REGEX.test(host);

    if (!isGem && !isOS) {
      throw new Error('URL `host` is not valid.');
    }
  } catch (error) {
    return false;
  }

  return true;
}

function parseBuyURL(url: string): {contractAddress: string; tokenID: string} {
  const {host, pathname} = new URL(url);

  const contractAddress =
    pathname.split(/\//).find((p, i) => {
      // e.g. `https://www.gem.xyz/asset/0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270/309000489`
      if (GEM_HOST_REGEX.test(host)) return i === 2 && isAddress(p);

      // e.g. `/assets/ethereum/0x335eeef8e93a7a757d9e7912044d9cd264e2b2d8/5314`
      if (OPENSEA_HOST_REGEX.test(host)) return i === 3 && isAddress(p);
    }) || '';

  const tokenID =
    pathname.split(/\//).find((p, i) => {
      // e.g. `/assets/ethereum/0x335eeef8e93a7a757d9e7912044d9cd264e2b2d8/5314`
      if (OPENSEA_HOST_REGEX.test(host)) {
        return i === 4 && Number.isInteger(parseInt(p));
      }

      // e.g. `https://www.gem.xyz/asset/0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270/309000489`
      if (GEM_HOST_REGEX.test(host)) {
        return i === 3 && Number.isInteger(parseInt(p));
      }
    }) || '';

  return {contractAddress, tokenID};
}

/**
 * Validate JSON Schema
 *
 * @param data
 * @param schema
 * @returns `T`
 *
 * @see https://github.com/colinhacks/zod
 * @see https://2ality.com/2020/06/validating-data-typescript.html#example%3A-validating-data-via-the-library-zod
 */
function validateResponse<T>(data: unknown, schema: ZodType<T>): T {
  // Return data, or throw.
  return schema.parse(data);
}

async function getImage(
  url: string
): Promise<{file: MessageAttachment | undefined; url: string}> {
  const DEFAULT_RETURN = {
    file: undefined,
    url,
  };

  try {
    const response = await fetch(url, {method: 'GET'});

    if (!response.ok) {
      throw new Error('Something went wrong while fetching the asset image.');
    }

    const contentType: string | null = response.headers.get('Content-Type');

    // Discord does not show SVG images natively
    if (contentType === 'image/svg+xml') {
      try {
        // Convert to PNG data buffer
        const buffer = await sharp(await response.buffer())
          .png()
          .toBuffer();

        return {
          file: new MessageAttachment(buffer, 'svg2png.png'),
          url: 'attachment://svg2png.png',
        };
      } catch (error) {
        return DEFAULT_RETURN;
      }
    }

    return DEFAULT_RETURN;
  } catch (error) {
    return DEFAULT_RETURN;
  }
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

  const assetResponse = await fetch(`${GEM_API_BASE_PATH}/assets`, {
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': GEM_API_KEY,
    },
    body: JSON.stringify({
      filters: {
        tokenIds: [tokenID],
        address: contractAddress,
      },
      fields: {
        address: 1,
        collectionName: 1,
        currentBasePrice: 1,
        currentEthPrice: 1,
        id: 1,
        marketplace: 1,
        marketUrl: 1,
        name: 1,
        paymentToken: 1,
        priceInfo: 1,
        sellOrders: 1,
        smallImageUrl: 1,
        standard: 1,
        tokenId: 1,
        url: 1,
      },
      offset: 0,
      limit: 1,
      status: ['all'],
    }),
    method: 'POST',
  });

  // Check Gem response
  if (!assetResponse.ok) {
    // Reply with an error/help message that only the user can see.
    await interaction.reply({
      content: POLL_SETUP_ERROR_MESSAGE,
      ephemeral: true,
    });

    return;
  }

  let assetResponseJSON: RequiredGemAssetResponse;

  try {
    assetResponseJSON = validateResponse<RequiredGemAssetResponse>(
      await assetResponse.json(),
      RequiredGemAssetResponseSchema
    );
  } catch (error) {
    // Reply with an error/help message that only the user can see.
    await interaction.reply({
      content: MISSING_ASSET_DATA_ERROR_MESSAGE,
      ephemeral: true,
    });

    return;
  }

  const {
    data: [{name, smallImageUrl, standard}],
  } = assetResponseJSON;

  /**
   * For the purposes of getting buy-related information,
   * using `/route` is currently better than using `/assets` for ERC-1155's.
   * It also works for ERC-721's.
   */
  const routeResponse = await fetch(`${GEM_API_BASE_PATH}/route`, {
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': GEM_API_KEY,
    },
    body: JSON.stringify({
      balanceToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      buy: [
        {
          address: contractAddress,
          amount: 1,
          standard,
          tokenId: tokenID,
        },
      ],
      // Should be empty as we are getting buy information
      sell: [],
      // We can set to 0x0 as there is no wallet
      sender: '0x0000000000000000000000000000000000000000',
    }),
    method: 'POST',
  });

  // Check Gem response
  if (!routeResponse.ok) {
    // Reply with an error/help message that only the user can see.
    await interaction.reply({
      content: POLL_SETUP_ERROR_MESSAGE,
      ephemeral: true,
    });

    return;
  }

  let routeResponseJSON: RequiredGemRouteResponse;

  try {
    routeResponseJSON = validateResponse<RequiredGemRouteResponse>(
      await routeResponse.json(),
      RequiredGemRouteResponseSchema
    );
  } catch (error) {
    /**
     * Reply with an error/help message that only the user can see.
     * It may be a brand new listing, already bought, unindexed, etc.
     */
    await interaction.reply({
      content: NO_PRICE_ERROR_MESSAGE,
      ephemeral: true,
    });

    return;
  }

  const {
    route: [
      {
        assetIn: {amount},
      },
    ],
  } = routeResponseJSON;

  const responsePriceWEI: string = toBN(
    typeof amount === 'string' ? amount : amount?.hex
  ).toString();

  if (!responsePriceWEI) {
    // Reply with an error/help message that only the user can see.
    await interaction.reply({
      content: NO_PRICE_ERROR_MESSAGE,
      ephemeral: true,
    });

    return;
  }

  // Gem UI asset URL does not get returned, currently.
  const gemAssetURL: string = `https://www.gem.xyz/asset/${contractAddress}/${tokenID}`;
  const price = fromWei(toBN(responsePriceWEI), 'ether');
  const dao = getDiscordDataByGuildID(
    interaction.guildId || '',
    await getDaoDiscordConfigs()
  );

  const image = await getImage(smallImageUrl);

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
    .setImage(image.url)
    .setFooter({
      text: 'After a threshold has been reached the vote is final,\neven if you change your vote.',
    });

  const cancelButton = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId(CANCEL_POLL_BUY_CUSTOM_ID)
      .setLabel('Cancel poll')
      .setStyle('SECONDARY')
  );

  // Reply to user
  const message = (await interaction.reply({
    components: [cancelButton],
    embeds: [embed],
    fetchReply: true,
    files: image.file ? [image.file] : undefined,
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
        amountWEI: responsePriceWEI,
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
    console.error(error);

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
