import {DaoData, EventNames} from '../../../../config/types';

export function filterDaosByActiveEvent(
  daos: Record<string, DaoData> | undefined = {},
  eventName: EventNames
): Record<string, DaoData> {
  return Object.fromEntries(
    Object.entries(daos).filter(([_, daoData]) => {
      const event = daoData.events.find((e) => e.name === eventName);

      return event?.active !== false;
    })
  );
}
