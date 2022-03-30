import {EventTributeTools} from './types';
import {tributeToolsEventEmitter} from '../../../singletons/eventEmitters';

export const TRIBUTE_TOOLS_ADMIN_FEE_EVENT: EventTributeTools<
  typeof tributeToolsEventEmitter
> = {
  eventEmitter: tributeToolsEventEmitter,
  name: 'adminFee',
};
