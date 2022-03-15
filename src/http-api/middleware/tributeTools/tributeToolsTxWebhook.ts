import {z} from 'zod';
import Application from 'koa';

import {
  HTTPMethod,
  TributeToolsWebhookPayload,
  TributeToolsWebhookTxStatus,
  TributeToolsWebhookTxType,
} from '../../types';
import {createHTTPError} from '../../helpers';
import {HTTP_API_BASE_PATH} from '../../config';
import {normalizeString} from '../../../helpers';
import {notifyPollTxStatus} from '../../../applications/tribute-tools';

const PATH: string = 'webhook/tribute-tools-tx';

const INVALID_BODY_ERROR: string = 'Incorrect `body` was provided.';
const NO_BODY_ERROR: string = 'No `body` was provided.';
const SERVER_ERROR: string =
  'Something went wrong while processing the webhook.';

const RequiredPayloadSchema = z.object({
  data: z.object({
    id: z.string().uuid(),
    type: z.nativeEnum(TributeToolsWebhookTxType),
    tx: z.object({
      hash: z.string().regex(/^0x/),
      status: z.nativeEnum(TributeToolsWebhookTxStatus),
    }),
  }),
});

/**
 * Validate JSON Schema
 *
 * @param data
 * @returns `TributeToolsWebhookPayload`
 * @see https://github.com/colinhacks/zod
 * @see https://2ality.com/2020/06/validating-data-typescript.html#example%3A-validating-data-via-the-library-zod
 */
function validatePayload(data: unknown): TributeToolsWebhookPayload {
  // Return data, or throw.
  return RequiredPayloadSchema.parse(data);
}

export const tributeToolsTxWebhook: Application.Middleware = async (
  ctx,
  next
): Promise<void> => {
  if (
    ctx.path !== `${HTTP_API_BASE_PATH}/${PATH}` ||
    normalizeString(ctx.method) !== normalizeString(HTTPMethod.POST)
  ) {
    return await next();
  }

  const body = ctx.request.body as TributeToolsWebhookPayload;

  // Check body
  if (!body || !Object.keys(body).length) {
    createHTTPError({ctx, message: NO_BODY_ERROR, status: 400});

    return;
  }

  let validatedPayload: TributeToolsWebhookPayload;

  try {
    // Validate payload
    validatedPayload = validatePayload(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        `Invalid JSON provided to ${PATH}: ${JSON.stringify(
          error.issues,
          null,
          2
        )}`
      );
    }

    createHTTPError({ctx, message: INVALID_BODY_ERROR, status: 400});

    return;
  }

  try {
    // Handle tx status in Discord application
    await notifyPollTxStatus(validatedPayload);
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      createHTTPError({ctx, message: SERVER_ERROR, status: 500});
    }

    return;
  }

  ctx.status = 204;
};
