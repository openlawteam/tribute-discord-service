import Router from '@koa/router';

const PATH: string = '/tx/:type/:uuid';

export const tributeToolsGetTx = (router: Router) => {
  router.get(PATH, async (ctx, next) => {
    ctx.status = 200;
    ctx.body = 'COol';
  });
};
