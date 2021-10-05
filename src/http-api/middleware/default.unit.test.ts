import {AddressInfo} from 'node:net';
import fetch from 'node-fetch';

import {HTTP_API_BASE_PATH} from '../config';
import {httpServer} from '../httpServer';

describe('defaultHandler unit tests', () => {
  test('should return response when `GET /`', async () => {
    const server = httpServer({noLog: true, useAnyAvailablePort: true});
    const {port} = server?.address() as AddressInfo;

    // Temporarily hide warnings from `msw`
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    expect(
      await (
        await fetch(`http://localhost:${port}${HTTP_API_BASE_PATH}`)
      ).text()
    ).toMatch(/^Hello, I am Tribute Discord Service!/i);

    // Cleanup

    consoleWarnSpy.mockRestore();

    await server?.close();
  });
});
