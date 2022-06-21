import {AddressInfo} from 'node:net';
import fetch from 'node-fetch';

import {
  SnapshotHubEventPayload,
  SnapshotHubEvents,
} from '../../../webhook-tasks/actions';
import {HTTP_API_BASE_PATH} from '../../config';
import {HTTPMethod} from '../../types';
import {httpServer} from '../../httpServer';

describe('snapshotWebhook unit tests', () => {
  const server = httpServer({noLog: true, useAnyAvailablePort: true});

  const DEFAULT_PAYLOAD: SnapshotHubEventPayload = {
    event: SnapshotHubEvents.PROPOSAL_CREATED,
    expire: 1655818345,
    id: 'proposal/123',
    space: 'test',
  };

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
          {
            body: JSON.stringify(DEFAULT_PAYLOAD),
            headers: {'Content-Type': 'application/json'},
            method: HTTPMethod.POST,
          }
        )
      ).status
    ).toBe(202);

    // Cleanup
    consoleWarnSpy.mockRestore();
  });

  test('should return 500 error code', async () => {
    const {port} = server?.address() as AddressInfo;

    // Temporarily hide warnings from `msw`
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    // Temporarily hide warnings from `msw`
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(
      await (
        await fetch(
          `http://localhost:${port}${HTTP_API_BASE_PATH}/snapshot-webhook`,
          {
            method: HTTPMethod.POST,
            body: JSON.stringify({...DEFAULT_PAYLOAD, event: 'bad'}),
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      ).status
    ).toBe(400);

    // Assert error logged

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    expect(consoleErrorSpy.mock.calls[0][0]).toMatch(
      /^Invalid body provided to \/snapshot\-webhook/i
    );

    // Cleanup
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
