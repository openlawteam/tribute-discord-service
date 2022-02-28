import Router from '@koa/router';

const PATH: string = '/tx/dao/:daoName/:type';

export const tributeToolsGetDaoTxs = (router: Router) => {
  router.get(PATH, async (ctx, next) => {
    ctx.status = 200;
    ctx.body = 'DAO';
  });
};
