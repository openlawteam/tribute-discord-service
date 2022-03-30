import {DiscordConfig} from '../../types';

const PRODUCTION_DISCORD_NAMES = ['tributeLabs'] as const;

export const PRODUCTION_DISCORD_CONFIGS: Record<
  typeof PRODUCTION_DISCORD_NAMES[number],
  DiscordConfig
> = {
  tributeLabs: {
    actions: [],
    baseURL: 'https://tributelabs.xyz',
    events: [],
    friendlyName: 'Tribute Labs [DEV]',
    guildID: '722525233755717762',
  },
};
