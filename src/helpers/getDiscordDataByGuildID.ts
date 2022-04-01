import {DiscordConfig} from '../config/types';
import {normalizeString} from './normalizeString';

export function getDiscordDataByGuildID<TDiscord extends DiscordConfig>(
  id: string,
  discords: Record<string, TDiscord> | undefined = {}
): TDiscord | undefined {
  if (!discords) return;

  return Object.entries(discords).find(
    ([_, {guildID}]) => normalizeString(guildID) === normalizeString(id)
  )?.[1];
}
