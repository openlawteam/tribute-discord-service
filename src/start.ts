import {envCheck} from './helpers';
import {runners} from './webhooks/runners';

// Check if all environment variables are set
envCheck();

export async function start() {
  Object.values(runners).forEach((r) => {
    r();
  });
}
