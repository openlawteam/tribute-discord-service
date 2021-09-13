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
  console.log(
    `Error while executing ${actionName} action for ${event.name} event.\nError: "${error.stack}"`
  );
}
