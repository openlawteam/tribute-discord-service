import {Daos} from '../../../../config/types';
import {getEnv, normalizeString} from '../../../../helpers';
import {EventBase} from '../../../events';

export function subscribeConnectedHandler(
  eventBase: EventBase,
  daos?: Daos
): (sid: string) => void {
  return (subscriptionId: string) => {
    const message: string = `Connected to Web3 subscriptions (subscription ID: ${subscriptionId}) for ${eventBase.name} event`;
    const debug = normalizeString(getEnv('DEBUG')) === 'true';

    const activeDaos: string =
      debug && daos
        ? Object.entries(daos).reduce((acc, next, i, coll) => {
            const uniqueName = next[0];
            const {registryContractAddress} = next[1];
            // If item is last, then no comma
            const maybeComma: string = i === coll.length - 1 ? '' : ', ';

            acc += `[${uniqueName} ${registryContractAddress}]${maybeComma}`;

            return acc;
          }, '')
        : '';

    if (debug) {
      console.log(`${message} on DAOs:\n${activeDaos}`);
      return;
    }

    console.log(message);
  };
}
