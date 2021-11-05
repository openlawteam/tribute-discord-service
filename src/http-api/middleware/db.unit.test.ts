import {AddressInfo} from 'node:net';
import fetch from 'node-fetch';

import {HTTP_API_BASE_PATH} from '../config';
import {httpServer} from '../httpServer';
import {prismaMock} from '../../../test/prismaMock';

describe('db unit tests', () => {
  const server = httpServer({noLog: true, useAnyAvailablePort: true});

  afterAll(async () => {
    await server?.close();
  });

  test('should return response when `GET /db`', async () => {
    // Mock result
    prismaMock.discordWebhook.findFirst.mockResolvedValue({
      id: 1,
      createdAt: new Date(0),
      webhookID: 'abc123',
      webhookToken: 'xyz123',
      name: 'Test Webhook',
    });

    const {port} = server?.address() as AddressInfo;

    // Temporarily hide warnings from `msw`
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    expect(
      await (
        await fetch(`http://localhost:${port}${HTTP_API_BASE_PATH}/db`)
      ).text()
    ).toMatch(/^Database is up and running\./i);

    // Cleanup
    consoleWarnSpy.mockRestore();
  });
});
