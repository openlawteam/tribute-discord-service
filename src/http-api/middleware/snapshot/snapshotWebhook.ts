import {z} from 'zod';
import Router from '@koa/router';

import {
  SnapshotHubEventPayload,
  SnapshotHubEvents,
} from '../../../webhook-tasks/actions';
import {createHTTPError, validateZod} from '../../helpers';
import {snapshotEventEmitter} from '../../../singletons/eventEmitters';

const RequiredPayloadSchema = z.object({
  event: z.nativeEnum(SnapshotHubEvents),
  expire: z.number(),
  id: z.string().regex(/^proposal\/.+/i),
  space: z.string(),
});

const PATH: string = '/snapshot-webhook';

const INVALID_BODY_ERROR: string = 'Incorrect `body` was provided.';

const SERVER_ERROR: string =
  'Something went wrong while processing the webhook.';

export function snapshotWebhook(router: Router): void {
  router.post(PATH, async (ctx) => {
    try {
      const validatedBody = validateZod<SnapshotHubEventPayload>(
        ctx.request.body,
        RequiredPayloadSchema
      );

      switch (validatedBody.event) {
        case SnapshotHubEvents.PROPOSAL_CREATED:
          snapshotEventEmitter.emit('proposalCreated', validatedBody);

          break;

        default:
          break;
      }

      ctx.status = 202;
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
