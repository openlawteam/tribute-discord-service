import {Prisma} from '@prisma/client';
import {z} from 'zod';
import Application from 'koa';

import {
  HTTPMethod,
  TributeToolsWebhookPayload,
  TributeToolsWebhookTxStatus,
  TributeToolsWebhookTxType,
} from '../types';
import {createHTTPError} from '../helpers';
import {HTTP_API_BASE_PATH} from '../config';
import {normalizeString} from '../../helpers';
import {prisma} from '../../singletons';

const PATH: string = 'webhook/tribute-tools-tx';

const NO_BODY_ERROR: string = 'No `body` was provided.';
const INVALID_BODY_ERROR: string = 'Incorrect `body` was provided.';

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

async function storeTxData(
  payload: TributeToolsWebhookPayload
): Promise<
  | ReturnType<
      | typeof prisma.floorSweeperPoll.update
      | typeof prisma.fundAddressPoll.update
      | typeof prisma.buyNFTPoll.update
    >
  | null
  | undefined
> {
  const {
    data: {
      id: uuid,
      type,
      tx: {hash: txHash, status: txStatus},
    },
  } = payload;

  try {
    switch (type) {
      case 'fund':
        return await prisma.fundAddressPoll.update({
          data: {txHash, txStatus},
          where: {uuid},
        });

      case 'singleBuy':
        return await prisma.buyNFTPoll.update({
          data: {txHash, txStatus},
          where: {uuid},
        });

      case 'sweep':
        return await prisma.floorSweeperPoll.update({
          data: {txHash, txStatus},
          where: {uuid},
        });

      default:
        break;
    }
  } catch (error) {
    console.error(error);

    /**
     * Handle return if record does not exist
     *
     * @see https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
     */
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error?.code === 'P2025') {
        return null;
      }
    }

    throw new Error(
      `Something went wrong while saving the transaction data for type \`${type}\` uuid \`${uuid}\`.`
    );
  }
}

export function tributeToolsTxWebhook(): Application.Middleware {
  return async (ctx, next): Promise<void> => {
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

    // Store data in database
    try {
      const updateResult = await storeTxData(validatedPayload);

      if (updateResult === null) {
        createHTTPError({
          ctx,
          message: `Could not find uuid \`${validatedPayload.data.id}\``,
          status: 404,
        });

        return;
      }
    } catch (error) {
      if (error instanceof Error) {
        createHTTPError({ctx, message: error.message, status: 500});
      }

      return;
    }

    ctx.status = 204;
  };
}
