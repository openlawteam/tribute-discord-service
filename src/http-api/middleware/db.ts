import Application from 'koa';

import {HTTP_API_BASE_PATH} from '../config';
import {prisma} from '../../singletons';

export function dbHandler(): Application.Middleware {
  return async (ctx, next): Promise<void> => {
    if (ctx.path !== `${HTTP_API_BASE_PATH}/db`) {
      return await next();
    }

    await prisma.discordWebhook.count();

    ctx.body = 'Database is up and running.';
  };
}
