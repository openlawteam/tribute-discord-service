import Application from 'koa';

import {HTTP_API_BASE_PATH} from '../config';
import {HTTPMethod} from '../types';
import {normalizeString} from '../../helpers';
import {snapshotProposalEventRunner} from '../../webhook-tasks/runners/snapshotHub';

const PATH: string = 'snapshot-webhook';

export function snapshotWebhookHandler(): Application.Middleware {
  return async (ctx, next): Promise<void> => {
    if (
      ctx.path !== `${HTTP_API_BASE_PATH}/${PATH}` ||
      normalizeString(ctx.method) !== normalizeString(HTTPMethod.POST)
    ) {
      return await next();
    }

    ctx.status = 202;

    // `koa-bodyparser` returns an empty object if no `body`
    if (!Object.keys(ctx.request.body).length) return;

    await snapshotProposalEventRunner(ctx.request.body);
  };
}
