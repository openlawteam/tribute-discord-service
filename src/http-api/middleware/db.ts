import Application from 'koa';

import {HTTP_API_BASE_PATH} from '../config';
import {prisma} from '../../singletons';

const PATH: string = 'db';

export const dbHandler: Application.Middleware = async (
  ctx,
  next
): Promise<void> => {
  if (ctx.path !== `${HTTP_API_BASE_PATH}/${PATH}`) {
    return await next();
  }

  await prisma.discordWebhook.findFirst({
    where: {
      id: {
        not: undefined,
      },
    },
  });

  ctx.body = 'Database is up and running.';
};
