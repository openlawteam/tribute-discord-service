import Router from '@koa/router';

import {HTTP_API_BASE_PATH} from '../../config';

/**
 * Koa `Router` Instance
 *
 * @note `prefix` is set
 */
const tributeToolsRouter = new Router({
  prefix: `${HTTP_API_BASE_PATH}/tribute-tools`,
});

/**
 * Register `@koa/router` routes
 *
 * (router: Router) => void
 */

/**
 * Export `@koa/router` routes
 */

export const tributeToolsRouterRoutes = tributeToolsRouter.routes();
