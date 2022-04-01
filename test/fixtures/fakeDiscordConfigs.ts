import {DiscordConfig} from '../../src/config';

const LOCALHOST_DISCORD_NAMES = ['tributeLabs'] as const;

export const DISCORD_CONFIGS_FIXTURE: Record<
  typeof LOCALHOST_DISCORD_NAMES[number],
  DiscordConfig
> = {
  tributeLabs: {
    actions: [
      {
        name: 'TRIBUTE_TOOLS_ADMIN_FEE_WEBHOOK',
        webhookID: 'abc123',
      },
    ],
    baseURL: 'https://tributelabs.xyz',
    events: [],
    friendlyName: 'Tribute Labs [DEV]',
    guildID: 'def456',
  },
};
