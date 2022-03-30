import {ActionConfig} from '../config/types';

export function isDaoActionActive(
  daoDataAction: ActionConfig | undefined
): boolean {
  if (!daoDataAction) return false;

  return daoDataAction.active !== false;
}
