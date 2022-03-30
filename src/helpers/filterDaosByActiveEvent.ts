import {DaoEntityConfig, EventNames} from '../config/types';

export function filterDaosByActiveEvent(
  daos: Record<string, DaoEntityConfig> | undefined = {},
  eventName: EventNames
): Record<string, DaoEntityConfig> {
  return Object.fromEntries(
    Object.entries(daos).filter(([_, daoData]) => {
      const event = daoData.events.find((e) => e.name === eventName);

      if (!event) return false;

      return event.active !== false;
    })
  );
}
