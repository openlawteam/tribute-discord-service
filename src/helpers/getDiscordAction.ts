import {ACTIONS} from '../config/actions';
import {DiscordConfig, ActionConfig} from '../config/types';
import {normalizeString} from '.';

export function getDiscordAction<TDiscord extends DiscordConfig>(
  actionName: typeof ACTIONS[number],
  discordData: TDiscord | undefined
): ActionConfig | undefined {
  return discordData?.actions.find(
    ({name}) => normalizeString(name) === normalizeString(actionName)
  );
}
