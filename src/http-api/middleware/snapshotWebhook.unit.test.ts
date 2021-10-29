import {AddressInfo} from 'node:net';
import fetch from 'node-fetch';

import {HTTP_API_BASE_PATH} from '../config';
import {HTTPMethod} from '../types';
import {httpServer} from '../httpServer';

describe('snapshotWebhook unit tests', () => {
  const server = httpServer({noLog: true, useAnyAvailablePort: true});

  afterAll(async () => {
    await server?.close();
  });

  test('should return response when `POST /snapshot-webhook`', async () => {
    const {port} = server?.address() as AddressInfo;

    // Temporarily hide warnings from `msw`
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    expect(
      await (
        await fetch(
          `http://localhost:${port}${HTTP_API_BASE_PATH}/snapshot-webhook`,
          {method: HTTPMethod.POST}
        )
      ).status
    ).toBe(202);

    // Cleanup
    consoleWarnSpy.mockRestore();
  });
});
