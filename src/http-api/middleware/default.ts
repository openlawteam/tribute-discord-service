import Application from 'koa';

import {HTTP_API_BASE_PATH} from '../config';

export function defaultHandler(): Application.Middleware {
  return async (ctx, next): Promise<void> => {
    if (ctx.path !== `${HTTP_API_BASE_PATH}`) {
      return await next();
    }

    ctx.body = 'Hello, I am Tribute Discord Service!';
  };
}
