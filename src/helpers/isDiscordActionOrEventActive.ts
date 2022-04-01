import {ActionConfig, EventConfig} from '../config/types';

export function isDiscordActionOrEventActive(
  discordActionOrEvent: ActionConfig | EventConfig | undefined
): boolean {
  // If action is empty, return `false`
  if (!discordActionOrEvent) return false;

  /**
   * If `active` setting `boolean` is not explicitly set to `false`,
   * then regard it as active.
   */
  return discordActionOrEvent.active !== false;
}
