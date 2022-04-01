import {ActionNames, DiscordConfig} from '../config';
import {isDiscordActionOrEventActive} from './isDiscordActionOrEventActive';

export function filterDiscordsByActiveAction<TDiscord extends DiscordConfig>(
  discords: Record<string, TDiscord> | undefined = {},
  actionName: ActionNames
): Record<string, TDiscord> {
  return Object.fromEntries(
    Object.entries(discords).filter(([_, data]) =>
      isDiscordActionOrEventActive(
        data.actions.find((e) => e.name === actionName)
      )
    )
  );
}
