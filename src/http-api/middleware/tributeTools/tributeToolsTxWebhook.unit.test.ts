import {AddressInfo} from 'node:net';
import fetch from 'node-fetch';

import {BYTES32_FIXTURE, UUID_FIXTURE} from '../../../../test/fixtures';
import {HTTP_API_BASE_PATH} from '../../config';
import {httpServer} from '../../httpServer';
import {TributeToolsWebhookTxStatus} from '../../types';

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

  const SWEEP_PAYLOAD = {
    data: {
      id: UUID_FIXTURE,
      type: 'sweep',
      tx: {
        hash: BYTES32_FIXTURE,
        status: TributeToolsWebhookTxStatus.SUCCESS,
      },
    },
  };

  const BUY_PAYLOAD = {
    ...SWEEP_PAYLOAD,
    data: {...SWEEP_PAYLOAD.data, type: 'singleBuy'},
  };

  const FUND_PAYLOAD = {
    ...SWEEP_PAYLOAD,
    data: {...SWEEP_PAYLOAD.data, type: 'fund'},
  };

  afterAll(async () => {
    await server?.close();
  });

  test('should return response when `POST`', async () => {
    const {port} = server?.address() as AddressInfo;

    const setPollTxStatus = await import(
      '../../../applications/tribute-tools/handlers/notifyPollTxStatus'
    );

    const setPollTxStatusSpy = jest
      .spyOn(setPollTxStatus, 'notifyPollTxStatus')
      .mockImplementation(async () => {});

    // Temporarily hide warnings from `msw`
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    const sweepResponse = await requestHelper(
      {body: JSON.stringify(SWEEP_PAYLOAD)},
      port
    );

    const singleBuyResponse = await requestHelper(
      {
        body: JSON.stringify(BUY_PAYLOAD),
      },
      port
    );

    const fundResponse = await requestHelper(
      {
        body: JSON.stringify(FUND_PAYLOAD),
      },
      port
    );

    expect(sweepResponse.status).toBe(204);
    expect(singleBuyResponse.status).toBe(204);
    expect(fundResponse.status).toBe(204);
    expect(setPollTxStatusSpy).toHaveBeenCalledTimes(3);
    expect(setPollTxStatusSpy).toHaveBeenNthCalledWith(1, SWEEP_PAYLOAD);
    expect(setPollTxStatusSpy).toHaveBeenNthCalledWith(2, BUY_PAYLOAD);
    expect(setPollTxStatusSpy).toHaveBeenNthCalledWith(3, FUND_PAYLOAD);

    // Cleanup
    consoleWarnSpy.mockRestore();
    setPollTxStatusSpy.mockRestore();
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
          ...SWEEP_PAYLOAD,
          data: {...SWEEP_PAYLOAD.data, type: 'BAD'},
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
          ...SWEEP_PAYLOAD,
          data: {...SWEEP_PAYLOAD.data, id: '123'},
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
          ...SWEEP_PAYLOAD,
          data: {...SWEEP_PAYLOAD.data, tx: undefined},
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
          ...SWEEP_PAYLOAD,
          data: {
            ...SWEEP_PAYLOAD.data,
            tx: {...SWEEP_PAYLOAD.data.tx, hash: 'abc123def456'},
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
          ...SWEEP_PAYLOAD,
          data: {
            ...SWEEP_PAYLOAD.data,
            tx: {...SWEEP_PAYLOAD.data.tx, status: 'BAD'},
          },
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
});
