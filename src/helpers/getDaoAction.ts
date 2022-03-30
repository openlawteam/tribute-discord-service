import {ACTIONS} from '../config/actions';
import {DaoDiscordConfig, ActionConfig} from '../config/types';
import {normalizeString} from '.';

export function getDaoAction(
  actionName: typeof ACTIONS[number],
  daoData: DaoDiscordConfig | undefined
): ActionConfig | undefined {
  return daoData?.actions.find(
    ({name}) => normalizeString(name) === normalizeString(actionName)
  );
}
