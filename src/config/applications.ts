/**
 * Register unique application names
 */
export const APPLICATIONS = ['FLOOR_SWEEPER_POLL_BOT'] as const;

/**
 * Application Client IDs
 */

export const FLOOR_SWEEPER_POLL_BOT_ID: string = '931125521645969448';

/**
 * Development Guild ID for faster development
 *
 * When writing Discord applications using
 * slash commands the guild commands are not cached, whereas
 * global (common for production) are, and take ~1 hour to propagate.
 *
 * @see https://discordjs.guide/interactions/registering-slash-commands.html#global-commands
 */
export const DEVELOPMENT_GUILD_ID: string =
  '722525233755717762'; /* Tribute Labs */
