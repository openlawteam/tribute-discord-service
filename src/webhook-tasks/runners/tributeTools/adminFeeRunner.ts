import {Daos} from '../../../config';
import {notifyAdminFee} from '../../actions';
import {removeListener} from '../helpers';
import {RunnerReturn} from '../types';
import {TRIBUTE_TOOLS_ADMIN_FEE_EVENT} from '../../events';

const {eventEmitter, name} = TRIBUTE_TOOLS_ADMIN_FEE_EVENT;

export function adminFeeRunner(_daos: Daos | undefined): RunnerReturn {
  eventEmitter?.on('adminFee', notifyAdminFee);

  const stop = async () => {
    removeListener({
      eventEmitter,
      listener: notifyAdminFee,
      name: 'adminFee',
    });
  };

  return {
    eventEmitter,
    eventName: name,
    stop,
  };
}
