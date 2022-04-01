import {DaoDiscordConfig, Daos} from '../config/types';
import {normalizeString} from './normalizeString';

export function getDaoDataByAddress(
  address: string,
  daos: Daos | undefined
): DaoDiscordConfig | undefined {
  if (!daos) return;

  return Object.entries(daos).find(
    ([_, {registryContractAddress}]) =>
      normalizeString(registryContractAddress) === normalizeString(address)
  )?.[1];
}
