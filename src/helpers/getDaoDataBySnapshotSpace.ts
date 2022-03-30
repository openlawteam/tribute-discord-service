import {DaoEntityConfig, Daos} from '../config/types';
import {normalizeString} from './normalizeString';

export function getDaoDataBySnapshotSpace(
  space: string,
  daos: Daos | undefined
): DaoEntityConfig | undefined {
  if (!daos) return;

  return Object.entries(daos).find(
    ([_, {snapshotHub}]) =>
      normalizeString(snapshotHub?.space) === normalizeString(space)
  )?.[1];
}
