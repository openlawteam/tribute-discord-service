import {DiscordConfig, EventNames} from '../config/types';
import {isDiscordActionOrEventActive} from './isDiscordActionOrEventActive';

export function filterDiscordsByActiveEvent<TDiscord extends DiscordConfig>(
  discords: Record<string, TDiscord> | undefined = {},
  eventName: EventNames
): Record<string, TDiscord> {
  return Object.fromEntries(
    Object.entries(discords).filter(([_, data]) =>
      isDiscordActionOrEventActive(
        data.events.find((e) => e.name === eventName)
      )
    )
  );
}
