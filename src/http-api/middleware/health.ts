import Application from 'koa';

import {HTTP_API_BASE_PATH} from '../config';

const PATH: string = 'health';

export function healthHandler(): Application.Middleware {
  return async (ctx, next): Promise<void> => {
    if (ctx.path !== `${HTTP_API_BASE_PATH}/${PATH}`) {
      return await next();
    }

    ctx.body = 'HTTP API is up and running.';
  };
}
