import {DaoData, Daos} from '../config/types';
import {normalizeString} from './normalizeString';

export function getDaoDataByGuildID(
  id: string,
  daos: Daos | undefined
): DaoData | undefined {
  if (!daos) return;

  return Object.entries(daos).find(
    ([_, {guildID}]) => normalizeString(guildID) === normalizeString(id)
  )?.[1];
}
