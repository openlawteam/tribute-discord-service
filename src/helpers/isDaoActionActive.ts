import {DaoDataAction} from '../config/types';

export function isDaoActionActive(
  daoDataAction: DaoDataAction | undefined
): boolean {
  if (!daoDataAction) return false;

  return daoDataAction.active !== false;
}
