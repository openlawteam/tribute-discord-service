import {DiscordConfig} from '../../types';

const DEVELOPMENT_DISCORD_NAMES = ['tributeLabs'] as const;

export const DEVELOPMENT_DISCORD_CONFIGS: Record<
  typeof DEVELOPMENT_DISCORD_NAMES[number],
  DiscordConfig
> = {
  tributeLabs: {
    actions: [
      {
        name: 'TRIBUTE_TOOLS_ADMIN_FEE_WEBHOOK',
        webhookID: '886976872611729439',
      },
    ],
    baseURL: 'https://tributelabs.xyz',
    events: [],
    friendlyName: 'Tribute Labs [DEV]',
    guildID: '722525233755717762',
  },
};
