import {getDaos} from '../services/dao/getDaos';
import {getEnv} from '../helpers';
import {RunnerReturn, runners} from './runners';

export async function startWebhookTasks(): Promise<RunnerReturn[]> {
  const daos = await getDaos();

  const runnersToReturn: RunnerReturn[] = [];

  if (!daos) {
    console.warn(`No DAO configuration found for APP_ENV=${getEnv('APP_ENV')}`);

    return [];
  }

  // Execute all registered runners
  await Promise.allSettled(
    Object.values(runners).map(async (r) => {
      // Start runner
      const runnerResult = await r(daos);

      // Save runner results to stop them later
      runnersToReturn.push(runnerResult);
    })
  );

  return runnersToReturn;
}
