import {CommandInteraction, Message} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {URL} from 'url';

import {Command} from '../../types';

const COMMAND_NAME: string = 'buy';

const COMMAND_DESCRIPTION: string = 'Creates a poll for buying a single NFT.';

const ARG_NAMES = {
  url: 'url',
};

const INVALID_URL_ERROR_MESSAGE: string = 'The URL is invalid.';

const INVALID_URL_HOST_ERROR_MESSAGE: string =
  'The URL host is not approved. Currently supported: OpenSea, Gem.';

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
    const u = new URL(url);

    const isGem = u.host.startsWith('gem.xyz');
    const isOS = u.host.startsWith('opensea.io');

    if (!isGem && !isOS) {
      throw new Error('URL `host` is not valid.');
    }
  } catch (error) {
    return false;
  }

  return true;
}

function parseBuyURL(): {contractAddress: `0x${string}`; tokenID: string} {
  return {contractAddress: '0x0', tokenID: '0'};
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
  const {data} = interaction.options;
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

  console.log('--DATA---', data);

  // Reply to user
  (await interaction.reply({
    content: ':robot: is in development.',
    fetchReply: true,
  })) as Message;
}

// Export
export const buy: Command = {
  data: command,
  execute,
};
