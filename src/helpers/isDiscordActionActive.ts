import {ActionConfig} from '../config/types';

export function isDiscordActionActive(
  discordAction: ActionConfig | undefined
): boolean {
  // If action is empty, return `false`
  if (!discordAction) return false;

  /**
   * If `active` setting `boolean` is not explicitly set to `false`,
   * then regard it as active.
   */
  return discordAction.active !== false;
}
