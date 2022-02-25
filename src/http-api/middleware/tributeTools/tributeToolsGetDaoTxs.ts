import Application from 'koa';

import {HTTP_API_BASE_PATH} from '../../config';

const PATH: string = '/tx/dao/:daoName/:type';

export function tributeToolsGetDaoTxs(): Application.Middleware {
  return async (ctx, next): Promise<void> => {
    if (ctx.path !== `${HTTP_API_BASE_PATH}/${PATH}`) {
      return await next();
    }

    ctx.status = 200;
  };
}
