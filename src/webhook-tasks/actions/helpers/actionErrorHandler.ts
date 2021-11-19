import {ActionNames} from '../../../config';
import {EventBase} from '../../events';

export function actionErrorHandler({
  actionName,
  event,
  error,
}: {
  actionName: ActionNames;
  event: EventBase;
  error: Error;
}): void {
  console.error(
    `Error while executing ${actionName} action for ${event.name} event.\n${
      error.stack || error
    }`
  );
}
