import {envCheck, getEnv} from './helpers';
import {getDaos} from './services/dao/getDaos';
import {runners} from './webhook-tasks/runners';

// Check if all environment variables are set
envCheck();

export async function start() {
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
