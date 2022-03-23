import Router from '@koa/router';
import {z} from 'zod';

import {createHTTPError, validateZod} from '../../helpers';
import {notifyAdminFee} from '../../../webhook-tasks/actions';

export const TributeToolsFeePayloadSchema = z.object({
  amount: z.string(),
  daoName: z.string(),
  description: z.string(),
});

export type TributeToolsFeeWebhookPayload = z.infer<
  typeof TributeToolsFeePayloadSchema
>;

const PATH: string = '/webhook/admin-fee';

const INVALID_BODY_ERROR: string = 'Incorrect `body` was provided.';

const SERVER_ERROR: string =
  'Something went wrong while processing the webhook.';

export function tributeToolsFeeWebhook(router: Router): void {
  router.post(PATH, async (ctx) => {
    let validatedBody: TributeToolsFeeWebhookPayload;

    try {
      validatedBody = validateZod<TributeToolsFeeWebhookPayload>(
        ctx.request.body,
        TributeToolsFeePayloadSchema
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(
          `Invalid body provided to ${PATH}: ${JSON.stringify(
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
      await notifyAdminFee(validatedBody);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        createHTTPError({ctx, message: SERVER_ERROR, status: 500});
      }

      return;
    }

    ctx.status = 200;
  });
}
