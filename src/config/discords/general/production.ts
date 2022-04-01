import {DiscordConfig} from '../../types';

const PRODUCTION_DISCORD_NAMES = ['tributeLabs'] as const;

export const PRODUCTION_DISCORD_CONFIGS: Record<
  typeof PRODUCTION_DISCORD_NAMES[number],
  DiscordConfig
> = {
  tributeLabs: {
    actions: [
      {
        name: 'TRIBUTE_TOOLS_ADMIN_FEE_WEBHOOK',
        webhookID: '956221982540709888',
      },
    ],
    baseURL: 'https://tributelabs.xyz',
    events: [],
    friendlyName: 'Tribute Labs',
    guildID: '722525233755717762',
  },
};
