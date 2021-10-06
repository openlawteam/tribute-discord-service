import Application from 'koa';

// @see https://github.com/koajs/koa/wiki/Error-Handling
export function errorHandler(): Application.Middleware {
  return async (ctx, next): Promise<void> => {
    try {
      await next();
    } catch (error) {
      ctx.status = 500;
      ctx.body = (error as Error).message;

      ctx.app.emit('error', error, ctx);
    }
  };
}
