import {getDaos} from '../services/dao/getDaos';
import {getEnv} from '../helpers';
import {RunnerReturn, runners} from './runners';

/**
 * Handles properly closing any processes started by runners
 * when Node receives certain signals.
 */
const handleExit =
  (stopRunners: RunnerReturn[]) => async (signal: NodeJS.Signals) => {
    console.log(`☠️  Received signal to terminate: ${signal}`);

    await Promise.allSettled(stopRunners.map(({stop}) => stop?.()));

    process.exit();
  };

export async function startWebhookTasks() {
  const daos = await getDaos();

  const stopRunners: RunnerReturn[] = [];

  if (!daos) {
    console.warn(`No DAO configuration found for APP_ENV=${getEnv('APP_ENV')}`);

    return;
  }

  // Execute all registered runners
  Object.values(runners).forEach((r) => {
    // Start runner
    const runnerResult = r(daos);

    // Save runner results to stop them later
    stopRunners.push(runnerResult);
  });

  // Handle a graceful exit
  process.on('SIGINT', handleExit(stopRunners));
  process.on('SIGTERM', handleExit(stopRunners));
  process.on('SIGQUIT', handleExit(stopRunners));
}
