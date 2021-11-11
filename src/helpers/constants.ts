import {MessageEmbedOptions} from 'discord.js';

/**
 * A black hole address used to burn ETH.
 *
 * In the case of legacy Tribute Snapshot Hub proposals,
 * this address is used to indicate a governance proposal in `actionId`.
 */
export const BURN_ADDRESS: '0x0000000000000000000000000000000000000000' =
  '0x0000000000000000000000000000000000000000';

/**
 * A helper for empty Discord `embeds`
 */
export const DISCORD_EMPTY_EMBED: MessageEmbedOptions[] = [];
