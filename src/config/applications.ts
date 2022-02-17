import {APP_ENV} from './common';

/**
 * Register unique application names
 */

export const APPLICATIONS = ['TRIBUTE_TOOLS_BOT'] as const;
export const APPLICATION_COMMANDS = ['BUY', 'SWEEP'] as const;

/**
 * Application Client IDs
 *
 * To keep the Discord bots as secure as possible we do not
 * use upstream bots locally in development.
 *
 * @see https://discord.com/developers/applications
 */

// Tribute Labs Discord Team Application IDs
export const TRIBUTE_TOOLS_BOT_ID: string =
  APP_ENV === 'production'
    ? '938837219282681936'
    : APP_ENV === 'development'
    ? '938835275696705556'
    : '938831672063954964'; /* localhost development */

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
