import Router from '@koa/router';

import {HTTP_API_BASE_PATH} from '../../config';
import {tributeToolsFeeWebhook} from './tributeToolsFeeWebhook';

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
tributeToolsFeeWebhook(tributeToolsRouter);

/**
 * Export `@koa/router` routes
 */

export const tributeToolsRouterRoutes = tributeToolsRouter.routes();
