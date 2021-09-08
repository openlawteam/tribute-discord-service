import {ActionNames} from '../types';
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
  const {name, type} = event;

  console.log(
    `Error while executing ${actionName} action for ${name} event (type: ${type}).\nError: "${error.message}"`
  );
}
