import {getDaos} from '../services/dao/getDaos';
import {getEnv} from '../helpers';
import {runners} from './runners';

export async function startWebhookTasks() {
  const daos = await getDaos();

  if (!daos) {
    console.warn(`No DAO configuration found for APP_ENV=${getEnv('APP_ENV')}`);

    return;
  }

  // Execute all registered runners
  Object.values(runners).forEach((r) => {
    r(daos);
  });
}
