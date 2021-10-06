import {AddressInfo} from 'node:net';
import fetch from 'node-fetch';

import {HTTP_API_BASE_PATH} from '../config';
import {httpServer} from '../httpServer';

describe('health unit tests', () => {
  const server = httpServer({noLog: true, useAnyAvailablePort: true});

  afterAll(async () => {
    await server?.close();
  });

  test('should return response when `GET /health`', async () => {
    const {port} = server?.address() as AddressInfo;

    // Temporarily hide warnings from `msw`
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    expect(
      await (
        await fetch(`http://localhost:${port}${HTTP_API_BASE_PATH}/health`)
      ).text()
    ).toMatch(/^HTTP API is up and running\./i);

    // Cleanup
    consoleWarnSpy.mockRestore();
  });
});
