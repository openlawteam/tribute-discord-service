import Application from 'koa';

import {HTTP_API_BASE_PATH} from '../config';
// import {prisma} from '../../singletons';
import {normalizeString} from '../../helpers';
import {
  HTTPMethod,
  TributeToolsWebhookTxStatus,
  TributeToolsWebhookTxType,
} from '../types';
import {createHTTPError} from '../helpers';

const PATH: string = 'webhook/tribute-tools-tx';
const NO_BODY_ERROR: string = 'No `body` was provided.';
const INVALID_BODY_ERROR: string = 'Incorrect `body` was provided.';

export function tributeToolsTxWebhook(): Application.Middleware {
  return async (ctx, next): Promise<void> => {
    if (
      ctx.path !== `${HTTP_API_BASE_PATH}/${PATH}` ||
      normalizeString(ctx.method) !== normalizeString(HTTPMethod.POST)
    ) {
      return await next();
    }

    const body = ctx.request.body;

    // Check body
    if (!body || !Object.keys(body).length) {
      createHTTPError({ctx, message: NO_BODY_ERROR, status: 400});

      return;
    }

    const doesTypeMatch: boolean = Object.values(
      TributeToolsWebhookTxType
    ).some((t) => t === body?.data?.type);

    const doesTxStatusMatch: boolean = Object.values(
      TributeToolsWebhookTxStatus
    ).some((s) => s === body?.data?.tx?.status);

    // Check body payload
    if (
      !body?.data ||
      !body?.data?.id ||
      !body?.data?.tx ||
      !body?.data?.tx?.hash ||
      !body?.data?.tx?.status ||
      !body?.data?.type ||
      !doesTxStatusMatch ||
      !doesTypeMatch ||
      !Object.keys(body?.data?.tx).length
    ) {
      createHTTPError({ctx, message: INVALID_BODY_ERROR, status: 400});

      return;
    }

    // @todo Store data in database

    ctx.status = 204;
  };
}
