import {AddressInfo} from 'node:net';
import {Prisma} from '@prisma/client';
import fetch from 'node-fetch';

import {
  TributeToolsWebhookTxStatus,
  TributeToolsWebhookTxType,
} from '../../types';
import {BYTES32_FIXTURE, UUID_FIXTURE} from '../../../../test/fixtures';
import {HTTP_API_BASE_PATH} from '../../config';
import {httpServer} from '../../httpServer';
import {prismaMock} from '../../../../test/prismaMock';

describe('tributeToolsTxWebhook unit tests', () => {
  const server = httpServer({noLog: true, useAnyAvailablePort: true});

  async function requestHelper(
    init: Parameters<typeof fetch>['1'],
    port: number
  ) {
    return await fetch(
      `http://localhost:${port}${HTTP_API_BASE_PATH}/webhook/tribute-tools-tx`,
      {
        headers: {'Content-Type': 'application/json'},
        method: 'POST',
        ...init,
      }
    );
  }

  function zodErrorHelper(errorMessage: string): Record<string, any>[] {
    const errors = errorMessage.split(
      /Invalid JSON provided to webhook\/tribute-tools-tx:/i
    )[1];

    return JSON.parse(errors);
  }

  const PAYLOAD = {
    data: {
      date: new Date(0),
      id: UUID_FIXTURE,
      type: 'sweep',
      tx: {
        hash: BYTES32_FIXTURE,
        status: TributeToolsWebhookTxStatus.SUCCESS,
      },
    },
    version: '1.0',
  };

  afterAll(async () => {
    await server?.close();
  });

  test('should return response when `POST`', async () => {
    const {port} = server?.address() as AddressInfo;

    const DB_PAYLOAD = {
      data: {
        txHash: BYTES32_FIXTURE,
        txStatus: TributeToolsWebhookTxStatus.SUCCESS,
      },
      where: {
        uuid: UUID_FIXTURE,
      },
    };

    /**
     * Mock results
     *
     * @todo Fix types
     */

    const buyNFTPollSpy = (
      prismaMock.buyNFTPoll as any
    ).update.mockResolvedValue({});

    const floorSweeperPollSpy = (
      prismaMock.floorSweeperPoll as any
    ).update.mockResolvedValue({});

    const fundAddressPollSpy = (
      prismaMock.fundAddressPoll as any
    ).update.mockResolvedValue({});

    jest
      .spyOn((await import('discord.js')).Client.prototype, 'login')
      .mockImplementation(async () => '');

    // Temporarily hide warnings from `msw`
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    const sweepResponse = await requestHelper(
      {body: JSON.stringify(PAYLOAD)},
      port
    );

    const singleBuyResponse = await requestHelper(
      {
        body: JSON.stringify({
          ...PAYLOAD,
          data: {...PAYLOAD.data, type: 'singleBuy'},
        }),
      },
      port
    );

    const fundResponse = await requestHelper(
      {
        body: JSON.stringify({
          ...PAYLOAD,
          data: {...PAYLOAD.data, type: 'fund'},
        }),
      },
      port
    );

    expect(sweepResponse.status).toBe(204);
    expect(singleBuyResponse.status).toBe(204);
    expect(fundResponse.status).toBe(204);

    // Assert data was stored in correct tables

    expect(floorSweeperPollSpy).toHaveBeenCalledTimes(1);
    expect(buyNFTPollSpy).toHaveBeenCalledTimes(1);
    expect(fundAddressPollSpy).toHaveBeenCalledTimes(1);
    expect(floorSweeperPollSpy).toHaveBeenNthCalledWith(1, DB_PAYLOAD);
    expect(buyNFTPollSpy).toHaveBeenNthCalledWith(1, DB_PAYLOAD);
    expect(fundAddressPollSpy).toHaveBeenNthCalledWith(1, DB_PAYLOAD);

    // Cleanup
    consoleWarnSpy.mockRestore();
  });

  test('should return `400` response when no `body`', async () => {
    const {port} = server?.address() as AddressInfo;

    // Temporarily hide warnings from `msw`
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    const response = await await fetch(
      `http://localhost:${port}${HTTP_API_BASE_PATH}/webhook/tribute-tools-tx`,
      {
        body: JSON.stringify({}),
        headers: {'Content-Type': 'application/json'},
        method: 'POST',
      }
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: {message: 'No `body` was provided.', status: 400},
    });

    // Cleanup
    consoleWarnSpy.mockRestore();
  });

  test('should return `400` response when invalid `body`', async () => {
    const {port} = server?.address() as AddressInfo;

    // Temporarily hide warnings from `msw`
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const missingDataResponse = await requestHelper(
      {
        body: JSON.stringify({
          bad: {},
        }),
      },
      port
    );

    // Assert `data` is not valid
    expect(missingDataResponse.status).toBe(400);
    expect(await missingDataResponse.json()).toEqual({
      error: {message: 'Incorrect `body` was provided.', status: 400},
    });

    expect(zodErrorHelper(consoleErrorSpy.mock.calls[0][0])).toEqual([
      {
        code: 'invalid_type',
        expected: 'object',
        message: 'Required',
        path: ['data'],
        received: 'undefined',
      },
    ]);

    const typeMatchResponse = await requestHelper(
      {
        body: JSON.stringify({
          ...PAYLOAD,
          data: {...PAYLOAD.data, type: 'BAD'},
        }),
      },
      port
    );

    // Assert `type` is not valid
    expect(typeMatchResponse.status).toBe(400);
    expect(await typeMatchResponse.json()).toEqual({
      error: {message: 'Incorrect `body` was provided.', status: 400},
    });

    expect(zodErrorHelper(consoleErrorSpy.mock.calls[1][0])).toEqual([
      {
        code: 'invalid_enum_value',
        message: "Invalid enum value. Expected 'singleBuy' | 'fund' | 'sweep'",
        options: ['singleBuy', 'fund', 'sweep'],
        path: ['data', 'type'],
      },
    ]);

    const missingIDResponse = await requestHelper(
      {
        body: JSON.stringify({
          ...PAYLOAD,
          data: {...PAYLOAD.data, id: '123'},
        }),
      },
      port
    );

    // Assert `id` is not valid
    expect(missingIDResponse.status).toBe(400);
    expect(await missingIDResponse.json()).toEqual({
      error: {message: 'Incorrect `body` was provided.', status: 400},
    });

    expect(zodErrorHelper(consoleErrorSpy.mock.calls[2][0])).toEqual([
      {
        code: 'invalid_string',
        message: 'Invalid uuid',
        path: ['data', 'id'],
        validation: 'uuid',
      },
    ]);

    const missingTxResponse = await requestHelper(
      {
        body: JSON.stringify({
          ...PAYLOAD,
          data: {...PAYLOAD.data, tx: undefined},
        }),
      },
      port
    );

    // Assert `tx` is not valid
    expect(missingTxResponse.status).toBe(400);
    expect(await missingTxResponse.json()).toEqual({
      error: {message: 'Incorrect `body` was provided.', status: 400},
    });

    expect(zodErrorHelper(consoleErrorSpy.mock.calls[3][0])).toEqual([
      {
        code: 'invalid_type',
        expected: 'object',
        message: 'Required',
        path: ['data', 'tx'],
        received: 'undefined',
      },
    ]);

    const malformedTxHashResponse = await requestHelper(
      {
        body: JSON.stringify({
          ...PAYLOAD,
          data: {
            ...PAYLOAD.data,
            tx: {...PAYLOAD.data.tx, hash: 'abc123def456'},
          },
        }),
      },
      port
    );

    // Assert `tx.status` is not valid
    expect(malformedTxHashResponse.status).toBe(400);
    expect(await malformedTxHashResponse.json()).toEqual({
      error: {message: 'Incorrect `body` was provided.', status: 400},
    });

    expect(zodErrorHelper(consoleErrorSpy.mock.calls[4][0])).toEqual([
      {
        code: 'invalid_string',
        message: 'Invalid',
        path: ['data', 'tx', 'hash'],
        validation: 'regex',
      },
    ]);

    const invalidTxStatusResponse = await requestHelper(
      {
        body: JSON.stringify({
          ...PAYLOAD,
          data: {...PAYLOAD.data, tx: {...PAYLOAD.data.tx, status: 'BAD'}},
        }),
      },
      port
    );

    // Assert `tx.status` is invalid
    expect(invalidTxStatusResponse.status).toBe(400);
    expect(await invalidTxStatusResponse.json()).toEqual({
      error: {message: 'Incorrect `body` was provided.', status: 400},
    });

    expect(zodErrorHelper(consoleErrorSpy.mock.calls[5][0])).toEqual([
      {
        code: 'invalid_enum_value',
        message: "Invalid enum value. Expected 'failed' | 'success'",
        options: ['failed', 'success'],
        path: ['data', 'tx', 'status'],
      },
    ]);

    // Assert `console.error` messages
    expect(consoleErrorSpy).toHaveBeenCalledTimes(6);

    // Cleanup
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  test('should return `404` response when not `POST`', async () => {
    const {port} = server?.address() as AddressInfo;

    // Temporarily hide warnings from `msw`
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    const response = await fetch(
      `http://localhost:${port}${HTTP_API_BASE_PATH}/webhook/tribute-tools-tx`
    );

    expect(response.status).toBe(404);

    // Cleanup
    consoleWarnSpy.mockRestore();
  });

  test('should return `404` response when `id` not found in DB', async () => {
    const {port} = server?.address() as AddressInfo;

    const DB_PAYLOAD = {
      data: {
        txHash: BYTES32_FIXTURE,
        txStatus: TributeToolsWebhookTxStatus.SUCCESS,
      },
      where: {
        uuid: UUID_FIXTURE,
      },
    };

    /**
     * Mock results
     *
     * @todo Fix types
     */

    const sweepPollSpy = (
      prismaMock.floorSweeperPoll as any
    ).update.mockImplementation(async () => {
      throw new Prisma.PrismaClientKnownRequestError(
        'Some bad error',
        // @see https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
        'P2025',
        '1.0'
      );
    });

    // Temporarily hide warnings from `msw`
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const sweepResponse = await requestHelper(
      {body: JSON.stringify(PAYLOAD)},
      port
    );

    expect(sweepResponse.status).toBe(404);

    expect(await sweepResponse.json()).toEqual({
      error: {
        message: `Could not find uuid \`${UUID_FIXTURE}\``,
        status: 404,
      },
    });

    expect(sweepPollSpy).toHaveBeenCalledTimes(1);
    expect(sweepPollSpy).toHaveBeenNthCalledWith(1, DB_PAYLOAD);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy.mock.calls[0][0]?.code).toBe('P2025');

    expect(consoleErrorSpy.mock.calls[0][0]?.message).toMatch(
      /some bad error/i
    );

    // Cleanup

    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  test('should return `500` response when DB fails to save tx data', async () => {
    const {port} = server?.address() as AddressInfo;

    const DB_PAYLOAD = {
      data: {
        txHash: BYTES32_FIXTURE,
        txStatus: TributeToolsWebhookTxStatus.SUCCESS,
      },
      where: {
        uuid: UUID_FIXTURE,
      },
    };

    /**
     * Mock results
     *
     * @todo Fix types
     */

    const floorSweeperPollSpy = (
      prismaMock.floorSweeperPoll as any
    ).update.mockImplementation(() => {
      throw new Error('Some bad error');
    });

    // Temporarily hide warnings from `msw`
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation((e) => e);

    const sweepResponse = await requestHelper(
      {body: JSON.stringify(PAYLOAD)},
      port
    );

    expect(sweepResponse.status).toBe(500);

    expect(await sweepResponse.json()).toEqual({
      error: {
        message: `Something went wrong while processing the webhook.`,
        status: 500,
      },
    });

    expect(floorSweeperPollSpy).toHaveBeenCalledTimes(1);
    expect(floorSweeperPollSpy).toHaveBeenNthCalledWith(1, DB_PAYLOAD);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);

    expect(consoleErrorSpy.mock.calls[0][0]?.message).toMatch(
      /some bad error/i
    );

    expect(consoleErrorSpy.mock.calls[1][0]?.message).toMatch(
      /something went wrong while saving the transaction data for type `sweep` uuid `02458ff0-4cc5-4137-bcf5-ef91053ab811`\./i
    );

    // Cleanup

    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });
});
