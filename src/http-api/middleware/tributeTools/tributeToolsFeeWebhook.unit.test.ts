import {AddressInfo} from 'node:net';
import fetch from 'node-fetch';

import {HTTP_API_BASE_PATH} from '../../config';
import {httpServer} from '../..';
import {tributeToolsEventEmitter} from '../../../singletons/eventEmitters';

describe('tributeToolsFeeWebhook unit tests', () => {
  const server = httpServer({noLog: true, useAnyAvailablePort: true});

  async function requestHelper(
    init: Parameters<typeof fetch>['1'],
    port: number
  ) {
    return await fetch(
      `http://localhost:${port}${HTTP_API_BASE_PATH}/tribute-tools/webhook/admin-fee`,
      {
        headers: {'Content-Type': 'application/json'},
        method: 'POST',
        ...init,
      }
    );
  }

  function zodErrorHelper(errorMessage: string): Record<string, any>[] {
    const errors = errorMessage.split(
      /Invalid body provided to \/webhook\/admin-fee\:/i
    )[1];

    return JSON.parse(errors);
  }

  const PAYLOAD = {
    amount: '1000000000000000000',
    daoName: 'tribute',
    description: 'Fee for tribute',
    totalContribution: '100000000000000000000',
  };

  afterAll(async () => {
    await server?.close();
  });

  test('should send 200 response', async () => {
    const spy = jest.fn();
    const {port} = server?.address() as AddressInfo;

    // Temporarily hide warnings from `msw`
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    tributeToolsEventEmitter.once('adminFee', spy);

    const response = await requestHelper({body: JSON.stringify(PAYLOAD)}, port);

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenNthCalledWith(1, PAYLOAD);

    // Cleanup

    consoleWarnSpy.mockRestore();
  });

  test('should send 400 response', async () => {
    const {port} = server?.address() as AddressInfo;

    // Temporarily hide warnings from `msw`
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    // Assert wrong type

    const badTypeResponse = await requestHelper(
      // Insert bad payload
      {body: JSON.stringify({...PAYLOAD, daoName: 123})},
      port
    );

    expect(badTypeResponse.ok).toBe(false);
    expect(badTypeResponse.status).toBe(400);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    expect(zodErrorHelper(consoleErrorSpy.mock.calls[0][0])).toEqual([
      {
        message: 'Expected string, received number',
        code: 'invalid_type',
        expected: 'string',
        received: 'number',
        path: ['daoName'],
      },
    ]);

    // Assert empty `string`

    const emptyStringResponse = await requestHelper(
      // Insert bad payload
      {body: JSON.stringify({...PAYLOAD, daoName: ''})},
      port
    );

    expect(emptyStringResponse.ok).toBe(false);
    expect(emptyStringResponse.status).toBe(400);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);

    expect(zodErrorHelper(consoleErrorSpy.mock.calls[1][0])).toEqual([
      {
        code: 'too_small',
        inclusive: true,
        message: 'String must contain at least 1 character(s)',
        minimum: 1,
        path: ['daoName'],
        type: 'string',
      },
    ]);

    // Cleanup

    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  test('should send 500 response', async () => {
    const {port} = server?.address() as AddressInfo;

    const ERROR = new Error('Some bad error.');

    const spy = jest.fn().mockImplementation(() => {
      throw ERROR;
    });

    tributeToolsEventEmitter.once('adminFee', spy);

    // Temporarily hide warnings from `msw`
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const response = await requestHelper({body: JSON.stringify(PAYLOAD)}, port);

    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenNthCalledWith(1, ERROR);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenNthCalledWith(1, PAYLOAD);

    // Cleanup

    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });
});
