import {DaoData} from '../../../../config/types';
import {EVENTS} from '../../../../config/events';

export function filterDaosByActiveEvent(
  daos: Record<string, DaoData> | undefined = {},
  eventName: typeof EVENTS[number]
): Record<string, DaoData> {
  return Object.fromEntries(
    Object.entries(daos).filter(([_, daoData]) => {
      const event = daoData.events.find((e) => e.name === eventName);

      return event?.active !== false;
    })
  );
}
