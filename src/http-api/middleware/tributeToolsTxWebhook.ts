import {Prisma} from '@prisma/client';
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

    // Store data in database
    try {
      const updateResult = await storeTxData(body);

      if (updateResult === null) {
        createHTTPError({
          ctx,
          message: `Could not find uuid \`${body.data.id}\``,
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
