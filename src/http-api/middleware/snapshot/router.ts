import Router from '@koa/router';

import {HTTP_API_BASE_PATH} from '../../config';
import {snapshotWebhook} from './snapshotWebhook';

/**
 * Koa `Router` Instance
 *
 * @note `prefix` is set
 */
const snapshotRouter = new Router({
  prefix: `${HTTP_API_BASE_PATH}`,
});

/**
 * Register `@koa/router` routes
 *
 * (router: Router) => void
 */
snapshotWebhook(snapshotRouter);

/**
 * Export `@koa/router` routes
 */

export const shapshotRouterRoutes = snapshotRouter.routes();
