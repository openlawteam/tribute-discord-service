import Router from '@koa/router';

import {HTTP_API_BASE_PATH} from '../../config';
import {tributeToolsGetTx} from './tributeToolsGetTx';

/**
 * Koa Router Instance
 *
 * @note `prefix` is set
 */
const tributeToolsRouter = new Router({
  prefix: `${HTTP_API_BASE_PATH}/tribute-tools`,
});

/**
 * Register routes
 */

tributeToolsGetTx(tributeToolsRouter);

/**
 * Export routes
 */

export const tributeToolsRouterRoutes = tributeToolsRouter.routes();
