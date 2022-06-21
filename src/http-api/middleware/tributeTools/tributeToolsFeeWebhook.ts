import {z} from 'zod';
import Router from '@koa/router';

import {createHTTPError, validateZod} from '../../helpers';
import {tributeToolsEventEmitter} from '../../../singletons/eventEmitters';

export const TributeToolsFeePayloadSchema = z.object({
  amount: z.string().min(1),
  daoName: z.string().min(1),
  description: z.string().min(1),
  totalContribution: z.string().min(1),
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
    try {
      const validatedBody = validateZod<TributeToolsFeeWebhookPayload>(
        ctx.request.body,
        TributeToolsFeePayloadSchema
      );

      tributeToolsEventEmitter.emit('adminFee', validatedBody);

      ctx.status = 200;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(
          `Invalid body provided to ${PATH}: ${JSON.stringify(
            error.issues,
            null,
            2
          )}`
        );

        // Respond with an error; perhaps the webhook will retry
        createHTTPError({ctx, message: INVALID_BODY_ERROR, status: 400});

        return;
      }

      console.error(error);

      if (error instanceof Error) {
        // Respond with an error; perhaps the webhook will retry
        createHTTPError({ctx, message: SERVER_ERROR, status: 500});
      }

      return;
    }
  });
}
