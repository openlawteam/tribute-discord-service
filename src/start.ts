import {envCheck} from './helpers';
import {runners} from './runners';

// Check if all environment variables are set
envCheck();

export async function start() {
  Object.values(runners).forEach((r) => {
    const stop = r();

    setTimeout(stop, 3000);
  });
}
