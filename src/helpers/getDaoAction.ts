import {ACTIONS} from '../config/actions';
import {DaoDiscordConfig, DaoDataAction} from '../config/types';
import {normalizeString} from '.';

export function getDaoAction(
  actionName: typeof ACTIONS[number],
  daoData: DaoDiscordConfig | undefined
): DaoDataAction | undefined {
  return daoData?.actions.find(
    ({name}) => normalizeString(name) === normalizeString(actionName)
  );
}
