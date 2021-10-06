import Application from 'koa';
import {HTTP_API_BASE_PATH} from '../config';

export function healthHandler(): Application.Middleware {
  return async (ctx, next): Promise<void> => {
    if (ctx.path !== `${HTTP_API_BASE_PATH}/health`) {
      return await next();
    }

    ctx.body = 'HTTP API is up and running.';
  };
}
