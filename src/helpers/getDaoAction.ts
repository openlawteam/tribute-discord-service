import {ACTIONS} from '../config/actions';
import {DaoEntityConfig, DaoDataAction} from '../config/types';
import {normalizeString} from '.';

export function getDaoAction(
  actionName: typeof ACTIONS[number],
  daoData: DaoEntityConfig | undefined
): DaoDataAction | undefined {
  return daoData?.actions.find(
    ({name}) => normalizeString(name) === normalizeString(actionName)
  );
}
