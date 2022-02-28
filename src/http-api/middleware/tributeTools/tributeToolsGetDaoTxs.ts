import {TributeToolsTxStatus} from '@prisma/client';
import {z} from 'zod';
import Router from '@koa/router';

import {createHTTPError} from '../../helpers';
import {getDaos} from '../../../services';
import {normalizeString} from '../../../helpers';
import {prisma} from '../../../singletons';
import {TributeToolsWebhookTxType} from '../../types';

type TributeToolsGetDaoTxParams = {
  daoName: string;
  type: TributeToolsWebhookTxType;
};

const PATH: string = '/tx/dao/:daoName/:type';

const RequiredParamsSchema = z.object({
  daoName: z.string(),
  type: z.nativeEnum(TributeToolsWebhookTxType),
});

const INVALID_PARAMS_ERROR: string = 'The provided parameters are invalid.';
const DAO_NOT_FOUND_ERROR: string = 'The DAO could not be found.';

/**
 * Validate JSON Schema
 *
 * @param data
 * @returns `TributeToolsGetDaoTxParams`
 * @see https://github.com/colinhacks/zod
 * @see https://2ality.com/2020/06/validating-data-typescript.html#example%3A-validating-data-via-the-library-zod
 */
function validateParams(data: unknown): TributeToolsGetDaoTxParams {
  // Return data, or throw.
  return RequiredParamsSchema.parse(data);
}

async function getTxData(params: {
  guildID: string;
  type: TributeToolsWebhookTxType;
}): Promise<
  | {
      txStatus: TributeToolsTxStatus | null;
      txHash: string | null;
    }[]
  | undefined
  | null
> {
  const {guildID, type} = params;

  try {
    switch (type) {
      case 'fund':
        return await prisma.fundAddressPoll.findMany({
          select: {txStatus: true, txHash: true},
          where: {guildID, NOT: [{txHash: null}, {txStatus: null}]},
        });

      case 'singleBuy':
        return await prisma.buyNFTPoll.findMany({
          select: {txStatus: true, txHash: true},
          where: {guildID, NOT: [{txHash: null}, {txStatus: null}]},
        });

      case 'sweep':
        return await prisma.floorSweeperPoll.findMany({
          select: {txStatus: true, txHash: true},
          where: {guildID, NOT: [{txHash: null}, {txStatus: null}]},
        });

      default:
        break;
    }
  } catch (error) {
    console.error(error);

    throw new Error(
      `Something went wrong while getting the transaction data for type \`${type}\`.`
    );
  }
}

export const tributeToolsGetDaoTxs = (router: Router) => {
  router.get(PATH, async (ctx) => {
    let validatedParams: TributeToolsGetDaoTxParams;

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

    const dao = Object.entries((await getDaos()) || {}).find(
      ([_, data]) =>
        normalizeString(data.internalName) ===
        normalizeString(validatedParams.daoName)
    )?.[1];

    if (!dao) {
      createHTTPError({ctx, message: DAO_NOT_FOUND_ERROR, status: 404});

      return;
    }

    const result = await getTxData({
      guildID: dao.guildID,
      type: validatedParams.type,
    });

    ctx.status = 200;
    ctx.body = result;
  });
};
