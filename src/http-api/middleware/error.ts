import Application from 'koa';

import {createHTTPError} from '../helpers';

// @see https://github.com/koajs/koa/wiki/Error-Handling
export const errorHandler: Application.Middleware = async (
  ctx,
  next
): Promise<void> => {
  try {
    await next();
  } catch (error) {
    createHTTPError({ctx, message: (error as Error).message, status: 500});

    ctx.app.emit('error', error, ctx);
  }
};
