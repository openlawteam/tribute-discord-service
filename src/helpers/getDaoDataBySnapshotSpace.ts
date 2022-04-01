import {DaoDiscordConfig, Daos} from '../config/types';
import {normalizeString} from './normalizeString';

export function getDaoDataBySnapshotSpace(
  space: string,
  daos: Daos | undefined
): DaoDiscordConfig | undefined {
  if (!daos) return;

  return Object.entries(daos).find(
    ([_, {snapshotHub}]) =>
      normalizeString(snapshotHub?.space) === normalizeString(space)
  )?.[1];
}
