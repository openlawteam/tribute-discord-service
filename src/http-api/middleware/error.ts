import Application from 'koa';

import {koaInstance as app} from '../';

export function errorHandler(): Application.Middleware {
  return async (ctx, next): Promise<void> => {
    // Catch all downstream errors
    try {
      await next();
    } catch (err) {
      ctx.status = 500;

      // Emit on app for log
      app.emit('error', err, ctx);
    }
  };
}
