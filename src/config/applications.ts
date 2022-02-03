import {APP_ENV} from './common';

/**
 * Register unique application names
 */

export const APPLICATIONS = ['FLOOR_SWEEPER_POLL_BOT'] as const;

/**
 * Application Client IDs
 *
 * To keep the Discord bots as secure as possible we do not
 * use upstream bots locally in development.
 *
 * @see https://discord.com/developers/applications
 */

// Tribute Labs Discord Team Application IDs
export const FLOOR_SWEEPER_POLL_BOT_ID: string =
  APP_ENV === 'production'
    ? '938779189161644062'
    : APP_ENV === 'development'
    ? '938775957949530113'
    : '938763190702063617'; /* localhost development */

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
