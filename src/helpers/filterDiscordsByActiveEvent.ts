import {DaoDiscordConfig, DiscordConfig, EventNames} from '../config/types';

export function filterDiscordsByActiveEvent<TDiscord extends DiscordConfig>(
  discords: Record<string, TDiscord> | undefined = {},
  eventName: EventNames
): Record<string, TDiscord> {
  return Object.fromEntries(
    Object.entries(discords).filter(([_, data]) => {
      const event = data.events.find((e) => e.name === eventName);

      if (!event) return false;

      return event.active !== false;
    })
  );
}
