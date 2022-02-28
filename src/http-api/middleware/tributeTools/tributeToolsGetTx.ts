import {z} from 'zod';
import Router from '@koa/router';

import {createHTTPError} from '../../helpers';
import {FundAddressPoll} from '@prisma/client';
import {prisma} from '../../../singletons';
import {TributeToolsWebhookTxType} from '../../types';

type TributeToolsGetTxParams = {
  type: TributeToolsWebhookTxType;
  uuid: string;
};

const PATH: string = '/tx/:type/:uuid';

const RequiredParamsSchema = z.object({
  type: z.nativeEnum(TributeToolsWebhookTxType),
  uuid: z.string().uuid(),
});

const INVALID_PARAMS_ERROR: string = 'The provided parameters are invalid.';
const NOT_FOUND_ERROR: string = 'The transaction was not found.';

/**
 * Validate JSON Schema
 *
 * @param data
 * @returns `TributeToolsGetTxParams`
 * @see https://github.com/colinhacks/zod
 * @see https://2ality.com/2020/06/validating-data-typescript.html#example%3A-validating-data-via-the-library-zod
 */
function validateParams(data: unknown): TributeToolsGetTxParams {
  // Return data, or throw.
  return RequiredParamsSchema.parse(data);
}

async function getTxData(params: TributeToolsGetTxParams): Promise<
  | {
      txStatus: FundAddressPoll['txStatus'] | null;
      txHash: FundAddressPoll['txHash'] | null;
    }
  | undefined
  | null
> {
  const {uuid, type} = params;

  try {
    switch (type) {
      case 'fund':
        return await prisma.fundAddressPoll.findUnique({
          select: {txStatus: true, txHash: true},
          where: {uuid},
        });

      case 'singleBuy':
        return await prisma.buyNFTPoll.findUnique({
          select: {txStatus: true, txHash: true},
          where: {uuid},
        });

      case 'sweep':
        return await prisma.floorSweeperPoll.findUnique({
          select: {txStatus: true, txHash: true},
          where: {uuid},
        });

      default:
        break;
    }
  } catch (error) {
    console.error(error);

    throw new Error(
      `Something went wrong while getting the transaction data for type \`${type}\` uuid \`${uuid}\`.`
    );
  }
}

export const tributeToolsGetTx = (router: Router) => {
  router.get(PATH, async (ctx) => {
    let validatedParams: TributeToolsGetTxParams;

    try {
      validatedParams = validateParams(ctx.params);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(
          `Invalid parameters provided to ${PATH}: ${JSON.stringify(
            error.issues,
            null,
            2
          )}`
        );
      }

      createHTTPError({ctx, message: INVALID_PARAMS_ERROR, status: 400});

      return;
    }

    const result = await getTxData(validatedParams);

    if (!result) {
      createHTTPError({ctx, message: NOT_FOUND_ERROR, status: 404});

      return;
    }

    ctx.status = 200;
    ctx.body = result;
  });
};
